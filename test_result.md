#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

## user_problem_statement: "Move Radius Filter Into Filter Panel & Remove Within 10km Button on Map Screen: Simplify the Map top bar by removing the standalone radius button and integrating it into the central Filter sheet."
## frontend:
##   - task: "Fix Map Screen Layer Hierarchy"
##     implemented: true
##     working: true
##     file: "frontend/src/components/FloatingTabBar.tsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       - working: true
##         agent: "main"
##         comment: "Offset the BottomSheet bottomInset by 64 + insets.bottom and updated the FloatingTabBar elevation to 20 on Android to ensure it sits above the BottomSheet's elevation of 12."
##   - task: "Redesign Map Navigation Bar & Bottom Sheet"
##     implemented: true
##     working: true
##     file: "frontend/src/components/FloatingTabBar.tsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       - working: true
##         agent: "main"
##         comment: "Redesigned FloatingTabBar into a docked solid warm cream (#F4F3ED) bar, showing all 5 buttons inline with forest green (#4E6C3B) active states. Updated TopSpotsBottomSheet background to solid cream with a custom shadow, updated text colors, and aligned bottomInset to 56 + bottomInset."
##   - task: "Refactor Map Screen Top Controls & Filter Structure"
##     implemented: true
##     working: true
##     file: "frontend/app/(tabs)/map.tsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       - working: true
##         agent: "main"
##         comment: "Replaced top zone, search bar, and filter pill backgrounds with solid light surfaces (white/milk-white) and SHADOWS.sm. Removed the Show button from top bar, bound the radius/filters buttons to open the new comprehensive MapFilterSheet.tsx modal containing Categories, Distance, Places (Highly Rated toggle), Events (Joined toggle), and Map Content modes."
##   - task: "Move Radius Filter Into Filter Panel & Remove Radius Button"
##     implemented: true
##     working: true
##     file: "frontend/app/(tabs)/map.tsx"
##     stuck_count: 0
##     priority: "high"
##     needs_retesting: true
##     status_history:
##       - working: true
##         agent: "main"
##         comment: "Completely removed the radius-selector button (Within 10km) from the top bar scroll view in map.tsx. Spacing has been rebalanced (now showing only Gdańsk and Filters), and distance values are fully managed and persisted inside MapFilterSheet.tsx."
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 4
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Move Radius Filter Into Filter Panel & Remove Radius Button"
##   stuck_tasks: []
##   test_all: false
##   test_priority: "high_first"
##
## agent_communication:
##   - agent: "main"
##     message: "Relocated the radius filter into the Filters interface, removed the Within 10km button from the Map top controls, and verified clean TypeScript compilation."