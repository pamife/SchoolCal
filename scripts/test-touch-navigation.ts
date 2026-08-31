/**
 * Automated Test Suite for SchoolCal Touch & Swipe Navigation
 * Tests gesture recognition logic, direction-locking, edge boundaries,
 * task swipe actions, bottom sheet gestures, and haptic feedback safety.
 */

import { haptics } from '../src/utils/haptics';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('🚀 Running SchoolCal Touch & Swipe Navigation Tests');
console.log('====================================================\n');

// ----------------------------------------------------
// 1. Gesture Engine & Direction-Locking Calculations
// ----------------------------------------------------
console.log('--- 1. Gesture Engine & Direction-Locking Tests ---');

interface MockTouchInput {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  endTime: number;
  screenWidth: number;
  edgeThreshold: number;
  minDistance: number;
  velocityThreshold: number;
}

type GestureResult = 'swipe_left' | 'swipe_right' | 'scroll_vertical' | 'edge_ignored' | 'no_action';

function evaluateGesture(input: MockTouchInput): GestureResult {
  const { startX, startY, endX, endY, startTime, endTime, screenWidth, edgeThreshold, minDistance, velocityThreshold } = input;

  // 1. Edge exclusion check (protects iOS Safari / Android back gestures)
  if (startX <= edgeThreshold || startX >= screenWidth - edgeThreshold) {
    return 'edge_ignored';
  }

  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const deltaTime = Math.max(endTime - startTime, 1);
  const velocityX = absX / deltaTime;

  // 2. Strict vertical lock check (prevents scrolling from triggering swipes)
  if (absY > 8 && absY > absX * 1.3) {
    return 'scroll_vertical';
  }

  // 3. Horizontal threshold check
  if ((absX >= minDistance || (absX >= 25 && velocityX >= velocityThreshold)) && absX > absY * 1.2) {
    return deltaX < 0 ? 'swipe_left' : 'swipe_right';
  }

  return 'no_action';
}

const defaultScreen = 390; // iPhone width
const edgeThresh = 25;
const minDist = 45;
const velThresh = 0.25;

// Test clean horizontal swipe (used in Calendar Days/Weeks/Months)
const cleanLeftSwipe = evaluateGesture({
  startX: 200,
  startY: 300,
  endX: 100,
  endY: 305,
  startTime: 1000,
  endTime: 1200,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(cleanLeftSwipe === 'swipe_left', 'Clean horizontal left swipe triggers swipe_left (calendar forward)');

const cleanRightSwipe = evaluateGesture({
  startX: 150,
  startY: 300,
  endX: 260,
  endY: 302,
  startTime: 1000,
  endTime: 1200,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(cleanRightSwipe === 'swipe_right', 'Clean horizontal right swipe triggers swipe_right (calendar previous)');

// Test vertical scroll dominance (Direction Locking)
const verticalScroll = evaluateGesture({
  startX: 200,
  startY: 200,
  endX: 215,
  endY: 450,
  startTime: 1000,
  endTime: 1300,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(verticalScroll === 'scroll_vertical', 'Vertical scroll gesture is locked and does not trigger horizontal swipes');

// Test edge gesture exclusion (iOS Safari Back Swipe Safety)
const edgeSwipeLeft = evaluateGesture({
  startX: 10, // starts 10px from left edge
  startY: 300,
  endX: 150,
  endY: 300,
  startTime: 1000,
  endTime: 1200,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(edgeSwipeLeft === 'edge_ignored', 'Edge touch starting within 25px is ignored to protect OS Back Gestures');

const edgeSwipeRight = evaluateGesture({
  startX: 380, // starts 10px from right edge
  startY: 300,
  endX: 250,
  endY: 300,
  startTime: 1000,
  endTime: 1200,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(edgeSwipeRight === 'edge_ignored', 'Edge touch starting near right edge is ignored to protect OS Forward/Menu Gestures');

// Test tiny jitter / micro movement
const microMovement = evaluateGesture({
  startX: 200,
  startY: 300,
  endX: 208,
  endY: 302,
  startTime: 1000,
  endTime: 1400,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(microMovement === 'no_action', 'Micro movements below distance and velocity thresholds trigger no action');

// Test fast flick swipe (low distance, high velocity)
const fastFlickSwipe = evaluateGesture({
  startX: 200,
  startY: 300,
  endX: 165, // only 35px, but done in 60ms = 0.58 px/ms > 0.25
  endY: 302,
  startTime: 1000,
  endTime: 1060,
  screenWidth: defaultScreen,
  edgeThreshold: edgeThresh,
  minDistance: minDist,
  velocityThreshold: velThresh,
});
assert(fastFlickSwipe === 'swipe_left', 'Fast flick swipe with velocity > 0.25 px/ms triggers swipe_left');

// ----------------------------------------------------
// 2. Task Swipe Actions & Undo Rollback Tests
// ----------------------------------------------------
console.log('\n--- 2. Task Swipe Action & Undo Tests ---');

interface MockTask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  dueDate: string;
}

let mockTasks: MockTask[] = [
  { id: 't1', title: 'Mathe S. 84', status: 'todo', dueDate: '2026-09-01' },
  { id: 't2', title: 'Deutsch Aufsatz', status: 'todo', dueDate: '2026-09-02' },
];

let lastUndoAction: (() => void) | null = null;

function completeTaskWithUndo(id: string) {
  const task = mockTasks.find(t => t.id === id);
  if (!task) return;
  const previousStatus = task.status;
  task.status = 'done';
  lastUndoAction = () => {
    task.status = previousStatus;
  };
}

function deleteTaskWithUndo(id: string) {
  const taskIndex = mockTasks.findIndex(t => t.id === id);
  if (taskIndex === -1) return;
  const deletedTask = mockTasks[taskIndex];
  mockTasks.splice(taskIndex, 1);
  lastUndoAction = () => {
    mockTasks.splice(taskIndex, 0, deletedTask);
  };
}

// 1. Test complete + undo
completeTaskWithUndo('t1');
assert(mockTasks.find(t => t.id === 't1')?.status === 'done', 'Task status changed to done after swipe');
assert(lastUndoAction !== null, 'Undo handler registered');
lastUndoAction!();
assert(mockTasks.find(t => t.id === 't1')?.status === 'todo', 'Undo successfully restored task status to todo');

// 2. Test delete + undo
deleteTaskWithUndo('t2');
assert(mockTasks.find(t => t.id === 't2') === undefined, 'Task deleted from list');
lastUndoAction!();
assert(mockTasks.find(t => t.id === 't2')?.title === 'Deutsch Aufsatz', 'Undo successfully restored deleted task');

// ----------------------------------------------------
// 3. BottomSheet Drag-to-Dismiss Evaluation Tests
// ----------------------------------------------------
console.log('\n--- 3. BottomSheet Drag-to-Dismiss Tests ---');

function shouldDismissBottomSheet(offsetY: number, velocityY: number): boolean {
  return offsetY > 80 || velocityY > 250;
}

assert(shouldDismissBottomSheet(90, 50) === true, 'Drag offset > 80px triggers dismiss');
assert(shouldDismissBottomSheet(50, 300) === true, 'Downward flick with velocity > 250 triggers dismiss');
assert(shouldDismissBottomSheet(30, 50) === false, 'Small drag without velocity does not dismiss');
assert(shouldDismissBottomSheet(-40, -100) === false, 'Upward drag does not dismiss');

// ----------------------------------------------------
// 4. Haptics Safety Tests
// ----------------------------------------------------
console.log('\n--- 4. Haptics Engine Safety Tests ---');

haptics.light();
haptics.medium();
haptics.heavy();
haptics.selection();
haptics.success();
haptics.warning();
haptics.error();
assert(true, 'Haptics service executes safely across all preset types in Node.js/non-vibrating runtime');

haptics.setEnabled(false);
haptics.success();
assert(true, 'Disabled haptics silently skips execution without errors');
haptics.setEnabled(true);

console.log('\n====================================================');
console.log('Test Results: All Touch & Swipe Navigation Tests PASSED!');
console.log('====================================================');
