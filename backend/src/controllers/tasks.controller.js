const path = require('path');
const fs = require('fs');
const multer = require('multer');

const {
  getTasksForUser,
  getTaskById,
  addTaskAttachment,
  getTaskAttachments,
  addTaskUpdate,
  getTaskUpdates
} = require('../models/queries');
const { notifyUser } = require('../services/notification.service');

const uploadsDir = path.join(__dirname, '../../uploads/tasks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const upload = multer({ storage });

const listMyTasks = async (req, res, next) => {
  try {
    const { status } = req.query;
    const tasks = await getTasksForUser(req.user.id);
    let data = tasks.rows;
    if (status) {
      data = data.filter((task) => task.status === status);
    }
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getTaskDetail = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await getTaskById(taskId);
    if (task.rowCount === 0 || task.rows[0].assigned_to !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const [attachments, updates] = await Promise.all([
      getTaskAttachments(taskId),
      getTaskUpdates(taskId)
    ]);

    return res.json({
      success: true,
      data: {
        ...task.rows[0],
        attachments: attachments.rows,
        updates: updates.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatusForWorker = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, comment, attachmentUrl = null } = req.body;

    const task = await getTaskById(taskId);
    if (task.rowCount === 0 || task.rows[0].assigned_to !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const update = await addTaskUpdate(taskId, req.user.id, status, comment, attachmentUrl);

    // Notify assigner
    if (task.rows[0].assigned_by) {
      await notifyUser(req.app, {
        userId: task.rows[0].assigned_by,
        type: 'task',
        title: `Task ${status}`,
        body: comment || `Task #${taskId} updated`,
        metadata: { taskId }
      });
    }

    return res.status(200).json({
      success: true,
      data: update.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const uploadTaskAttachment = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const task = await getTaskById(taskId);
      if (task.rowCount === 0 || task.rows[0].assigned_to !== req.user.id) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }

      const relativePath = path.relative(path.join(__dirname, '../..'), req.file.path).replace(/\\/g, '/');
      const attachment = await addTaskAttachment(
        taskId,
        req.user.id,
        `/${relativePath}`,
        req.file.mimetype
      );

      await addTaskUpdate(taskId, req.user.id, task.rows[0].status, 'Attachment uploaded', `/${relativePath}`);

      return res.status(201).json({
        success: true,
        data: attachment.rows[0]
      });
    } catch (error) {
      next(error);
    }
  }
];

module.exports = {
  listMyTasks,
  getTaskDetail,
  updateTaskStatusForWorker,
  uploadTaskAttachment
};

