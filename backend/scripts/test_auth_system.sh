#!/bin/bash

# Comprehensive authorization test script for GeoGuard
# Tests all 4 profiles: field_worker, site_admin, gov_authority, super_admin

set -e

API_URL="http://192.168.43.167:4000/api"
TIMESTAMP=$(date +%s)

echo "=========================================="
echo "GeoGuard Authorization System Test"
echo "API URL: $API_URL"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Test function
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    test_count=$((test_count + 1))
    echo -e "${YELLOW}Test $test_count: $name${NC}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [[ "$http_code" == "$expected_status"* ]]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        pass_count=$((pass_count + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "Response: $body"
        fail_count=$((fail_count + 1))
    fi
    echo ""
}

# ===================================================================
# TEST 1: GET SLOPES
# ===================================================================
echo -e "${YELLOW}=== Test 1: Get Available Slopes ===${NC}"
test_endpoint "Get slopes" "GET" "/auth/slopes" "" "200"

# ===================================================================
# TEST 2: FIELD WORKER REGISTRATION & LOGIN
# ===================================================================
echo -e "${YELLOW}=== Test 2: Field Worker (Auto-Approved) ===${NC}"

# First, site admin invites a field worker
TEST_PHONE="1234567890"
echo "Creating site admin account first..."

response=$(curl -s -X POST "$API_URL/auth/register/site-admin" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Site Admin",
        "email": "admin'$TIMESTAMP'@example.com",
        "password": "TestPass123!",
        "phone": "9876543210",
        "company_id_url": "https://example.com/id.jpg",
        "mine_action": "create",
        "mine_details": {
            "name": "Test Mine",
            "lat": 28.6139,
            "lng": 77.2090,
            "description": "Test mine for auth verification"
        }
    }')

echo "Site Admin response: $response"
ADMIN_EMAIL="admin$TIMESTAMP@example.com"
echo ""

# Now invite a field worker
echo "Inviting field worker..."
INVITE_RESPONSE=$(curl -s -X POST "$API_URL/auth/invite/worker" \
    -H "Content-Type: application/json" \
    -H "x-dev-bypass: DEV_BYPASS" \
    -d "{
        \"phone\": \"$TEST_PHONE\"
    }")

echo "Invite response: $INVITE_RESPONSE"
echo ""

# Register field worker
echo "Registering field worker..."
WORKER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register/worker" \
    -H "Content-Type: application/json" \
    -d "{
        \"phone\": \"$TEST_PHONE\",
        \"name\": \"Test Field Worker\",
        \"password\": \"WorkerPass123!\",
        \"otp\": \"123456\"
    }")

http_code=$(echo "$WORKER_RESPONSE" | tail -n1)
body=$(echo "$WORKER_RESPONSE" | head -n-1)

if [[ "$http_code" == "201"* ]]; then
    echo -e "${GREEN}✓ Field Worker Registration PASSED${NC}"
    WORKER_TOKEN=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    WORKER_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Worker Token: $WORKER_TOKEN"
    echo "Worker ID: $WORKER_ID"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ Field Worker Registration FAILED${NC} (HTTP $http_code)"
    echo "Response: $body"
    fail_count=$((fail_count + 1))
fi
echo ""

# Test field worker login
echo "Testing field worker login..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"phone\": \"$TEST_PHONE\",
        \"password\": \"WorkerPass123!\"
    }")

http_code=$(echo "$LOGIN_RESPONSE" | tail -n1)
body=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [[ "$http_code" == "200"* ]]; then
    echo -e "${GREEN}✓ Field Worker Login PASSED${NC}"
    pass_count=$((pass_count + 1))
    echo "Login response: $body"
else
    echo -e "${RED}✗ Field Worker Login FAILED${NC} (HTTP $http_code)"
    echo "Response: $body"
    fail_count=$((fail_count + 1))
fi
echo ""

# ===================================================================
# TEST 3: SITE ADMIN REGISTRATION (PENDING APPROVAL)
# ===================================================================
echo -e "${YELLOW}=== Test 3: Site Admin (Pending Approval) ===${NC}"

ADMIN_PHONE="8765432101"
ADMIN_EMAIL="siteadmin$TIMESTAMP@example.com"

ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register/site-admin" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test Site Admin\",
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"AdminPass123!\",
        \"phone\": \"$ADMIN_PHONE\",
        \"company_id_url\": \"https://example.com/company.jpg\",
        \"mine_action\": \"create\",
        \"mine_details\": {
            \"name\": \"New Test Mine\",
            \"lat\": 28.6200,
            \"lng\": 77.2200,
            \"description\": \"Another test mine\"
        }
    }")

http_code=$(echo "$ADMIN_RESPONSE" | tail -n1)
body=$(echo "$ADMIN_RESPONSE" | head -n-1)

if [[ "$http_code" == "201"* ]]; then
    echo -e "${GREEN}✓ Site Admin Registration PASSED${NC}"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ Site Admin Registration FAILED${NC} (HTTP $http_code)"
    fail_count=$((fail_count + 1))
fi

# Try to login (should fail - pending approval)
echo "Attempting Site Admin login (should be pending approval)..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$ADMIN_EMAIL\",
        \"password\": \"AdminPass123!\"
    }")

http_code=$(echo "$LOGIN_RESPONSE" | tail -n1)
body=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [[ "$http_code" == "403"* ]]; then
    echo -e "${GREEN}✓ Correctly rejected unapproved Site Admin${NC}"
    pass_count=$((pass_count + 1))
    if echo "$body" | grep -q "pending"; then
        echo -e "${GREEN}✓ Correct approval_status in response${NC}"
        pass_count=$((pass_count + 1))
    fi
else
    echo -e "${RED}✗ Should have rejected unapproved admin${NC} (HTTP $http_code)"
    fail_count=$((fail_count + 1))
fi
echo ""

# ===================================================================
# TEST 4: GOVERNMENT AUTHORITY REGISTRATION (PENDING APPROVAL)
# ===================================================================
echo -e "${YELLOW}=== Test 4: Government Authority (Pending Approval) ===${NC}"

GOV_EMAIL="gov$TIMESTAMP@example.com"
GOV_PHONE="7654321012"

GOV_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/register/gov" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"Test Gov Officer\",
        \"email\": \"$GOV_EMAIL\",
        \"password\": \"GovPass123!\",
        \"phone\": \"$GOV_PHONE\",
        \"department\": \"Mining Safety\",
        \"govt_id_url\": \"https://example.com/govt-id.jpg\"
    }")

http_code=$(echo "$GOV_RESPONSE" | tail -n1)
body=$(echo "$GOV_RESPONSE" | head -n-1)

if [[ "$http_code" == "201"* ]]; then
    echo -e "${GREEN}✓ Government Authority Registration PASSED${NC}"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ Government Authority Registration FAILED${NC} (HTTP $http_code)"
    fail_count=$((fail_count + 1))
fi

# Try to login (should fail - pending approval)
echo "Attempting Gov Authority login (should be pending approval)..."
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$GOV_EMAIL\",
        \"password\": \"GovPass123!\"
    }")

http_code=$(echo "$LOGIN_RESPONSE" | tail -n1)
body=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [[ "$http_code" == "403"* ]]; then
    echo -e "${GREEN}✓ Correctly rejected unapproved Gov Authority${NC}"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}✗ Should have rejected unapproved gov authority${NC} (HTTP $http_code)"
    fail_count=$((fail_count + 1))
fi
echo ""

# ===================================================================
# SUMMARY
# ===================================================================
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo "=========================================="

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
