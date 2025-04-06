import { Direction } from "./direction";

/**
 * BFS 算法：从给定蛇的状态出发，考虑障碍物，寻找通往目标的最短路径。
 *
 * @param snake 蛇的状态，数组长度为 8，依次为蛇头、第二节、第三节、蛇尾（第四节）的坐标（坐标均为 i32）
 * @param food 果子坐标，[x, y]（坐标为 i32）
 * @param barriers 额外的障碍物坐标，每两个数字为一组（例如其他蛇的前三节）
 * @param boardSize 棋盘边界，坐标范围为 1 ~ boardSize
 * @returns 若可达，返回 [firstMove, distance]；若不可达，则返回 [-1, -1]
 */
export function bfsSnake(
    snake: Array<i32>,
    food: Array<i32>,
    barriers: Array<i32>,
    boardSize: i32
): Array<i32> {
  // 队列中每个状态数组长度为 10：
  // [蛇头x, 蛇头y, 第二节x, 第二节y, 第三节x, 第三节y, 蛇尾x, 蛇尾y, firstMove, depth]
  let queue = new Array<Array<i32>>();
  let visited = new Set<string>();

  // 用于生成状态的 key（仅用蛇身的前8个数字）
  function stateKey(state: Array<i32>): string {
    return state.slice(0, 8).join(",");
  }

  // 初始状态：firstMove 未定（置为 -1），depth 为 0
  let initState = new Array<i32>(10);
  for (let i = 0; i < 8; i++) {
    initState[i] = snake[i];
  }
  initState[8] = -1;
  initState[9] = 0;

  queue.push(initState);
  visited.add(stateKey(initState));

  // 定义移动方向：0-上, 1-左, 2-下, 3-右
  let dx = [0, -1, 0, 1];
  let dy = [1, 0, -1, 0];

  // 最多扩展 200 回合，防止搜索过深
  while (queue.length > 0) {
    let current = queue.shift();
    let depth = current[9];
    let firstMove = current[8];

    if (depth >= 200) continue;

    let headX = current[0], headY = current[1];

    for (let dir : Direction = 0; dir < 4; dir++) {
      let newHeadX = headX + dx[dir];
      let newHeadY = headY + dy[dir];

      // 检查边界
      if (newHeadX < 1 || newHeadX > boardSize || newHeadY < 1 || newHeadY > boardSize)
        continue;

      // 检查额外障碍物
      let hitBarrier = false;
      for (let i = 0; i < barriers.length; i += 2) {
        if (newHeadX == barriers[i] && newHeadY == barriers[i + 1]) {
          hitBarrier = true;
          break;
        }
      }
      if (hitBarrier) {
        continue;
      }

      // 蛇体碰撞检查（只检测前三节，蛇尾留空）
      let hitSnake = false;
      for (let i = 0; i < 6; i += 2) {
        if (newHeadX == current[i] && newHeadY == current[i + 1]) {
          hitSnake = true;
          break;
        }
      }
      if (hitSnake) {
        continue;
      }

      // 模拟下一回合：新的蛇状态为 [新头, 原头, 原第二节, 原第三节]
      let newState = new Array<i32>(10);
      newState[0] = newHeadX;
      newState[1] = newHeadY;
      for (let i = 0; i < 6; i++) {
        newState[i + 2] = current[i];
      }
      // 如果当前状态还未选定第一步，则本次移动作为第一步；否则继承已有的 firstMove
      newState[8] = (firstMove == -1 ? dir : firstMove);
      newState[9] = depth + 1;

      // 找到果子
      if (newHeadX == food[0] && newHeadY == food[1]) {
        return [newState[8], newState[9]];
      }

      let key = stateKey(newState);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(newState);
      }
    }
  }
  //trace("\n==========\n[DEBUG] BFS 未找到路径，返回 [-1, -1]\n==========\n");
  return [-1, -1];
}

// 计算曼哈顿距离
export function manhattan(a: Array<i32>, b: Array<i32>): i32 {
  let dist = (a[0] > b[0] ? a[0] - b[0] : b[0] - a[0])
      + (a[1] > b[1] ? a[1] - b[1] : b[1] - a[1]);
  return dist;
}

// 根据所有蛇构造障碍物：对指定 snakeIndex，其它蛇的前三节（索引 0～5），蛇尾不必计算
export function getObstaclesForSnake(snakeIndex: i32, allSnakes: Array<Array<i32>>): Array<i32> {
  let obstacles = new Array<i32>();
  for (let j = 0; j < allSnakes.length; j++) {
    if (j == snakeIndex) continue;
    let s = allSnakes[j];
    for (let k = 0; k < 6; k++) {
      obstacles.push(s[k]);
    }
    // obstacles.push(s[0] + 1);
    // obstacles.push(s[1]);
    // obstacles.push(s[0] - 1);
    // obstacles.push(s[1]);
    // obstacles.push(s[0]);
    // obstacles.push(s[1] + 1);
    // obstacles.push(s[0]);
    // obstacles.push(s[1] - 1);


  }
  return obstacles;
}

// 自定义排序函数：用选择排序对 candidateFoods 排序（不使用闭包）
function sortCandidateFoods(candidateFoods: Array<i32>, distances: Array<Array<Move>>, snakeIndex: i32): void {
  let len = candidateFoods.length;
  for (let i = 0; i < len; i++) {
    let minIndex = i;
    for (let j = i + 1; j < len; j++) {
      if (distances[snakeIndex][candidateFoods[j]].distance < distances[snakeIndex][candidateFoods[minIndex]].distance) {
        minIndex = j;
      }
    }
    // swap
    let temp = candidateFoods[i];
    candidateFoods[i] = candidateFoods[minIndex];
    candidateFoods[minIndex] = temp;
  }
}

// 对所有蛇和所有果子计算初始距离矩阵
// distances[i][f] 表示第 i 条蛇到第 f 个果子的 BFS 距离，若不可达则记为 Infinity
export function computeDistances(allSnakes: Array<Array<i32>>, fruits: Array<fruit>, boardSize: i32): Array<Array<Move>> {
  let distances = new Array<Array<Move>>();
  for (let i = 0; i < allSnakes.length; i++) {
    let row = new Array<Move>();
    let obstacles = getObstaclesForSnake(i, allSnakes);
    for (let f: i32 = 0; f < fruits.length; f++) {
      let fruit = fruits[f];
      let result = bfsSnake(allSnakes[i], fruit.fruitCoord, obstacles, boardSize);
      let move = new Move(Direction.ERROR, 1000);
      if (result[0] != -1) {
        move = new Move(result[0], result[1]);
      }
      row.push(move);
    }
    distances.push(row);
  }
  return distances;
}

/* 将候选结果从 interface 改为 class */
class Candidate {
  move: Move;
  fruit: fruit;

  constructor(direction: i32, distance: i32, fruitIndex: i32, fruitCoord: Array<i32>) {
    this.move = new Move(direction, distance);
    this.fruit = new fruit(fruitIndex, fruitCoord);
  }

}

class fruit {
  fruitIndex: i32;
  fruitCoord: Array<i32>; // 长度为 2：[x, y]

  constructor(fruitIndex: i32, fruitCoord: Array<i32>) {
    this.fruitIndex = fruitIndex;
    this.fruitCoord = fruitCoord;
  }
}

/* 定义 OtherCandidate 类，用于保存其他蛇的候选结果 */
class OtherCandidate {
  snakeIndex: i32;
  candidate: Candidate;

  constructor(snakeIndex: i32, candidate: Candidate) {
    this.snakeIndex = snakeIndex;
    this.candidate = candidate;
  }
}

class Move {
  direction: Direction;
  distance: i32;

  constructor(direction: Direction, distance: i32) {
    this.direction = direction;
    this.distance = distance;
  }
}

// 对指定蛇（snakeIndex），从当前 distances 中选出候选果子，并调用 BFS 得到实际移动方案
export function candidateForSnake(
    snakeIndex: i32,
    distances: Array<Array<Move>>,
    boardSize: i32,
    snake: Array<i32>,
    fruits: Array<fruit>,
    allSnakes: Array<Array<i32>>,
    iteration: i32
): Candidate {
  let candidateFoods = new Array<i32>(); // 存储候选果子索引
  // 按要求：己蛇到果子距离不为 Infinity 且比其他所有蛇都快或速度相同
  for (let f: i32 = 0; f < fruits.length; f++) {
    if (distances[snakeIndex][f].distance == Infinity) continue;
    let accepted = true;
    for (let j: i32 = 0; j < allSnakes.length; j++) {
      if (j == snakeIndex) continue;
      if (distances[j][f].distance <= distances[snakeIndex][f].distance) {
        accepted = false;
        break;
      }
    }
    if (accepted) {
      candidateFoods.push(f);
    }
  }
  // 如果候选数量小于当前迭代次数，则返回无效结果
  if (candidateFoods.length <= iteration) {
    return new Candidate(Direction.ERROR, -1, -1, new Array<i32>());
  }
  // 采用绝对距离第iteration小的候选果子
  sortCandidateFoods(candidateFoods, distances, snakeIndex);
  let fruitIndex = candidateFoods[iteration];
  let iterFruit = fruits[fruitIndex];
  let iterMove = distances[snakeIndex][fruitIndex];
  return new Candidate(iterMove.direction, iterMove.distance, iterFruit.fruitIndex, iterFruit.fruitCoord);

}

// 辅助函数：打印 distances 矩阵（每行显示每个果子的 [direction, distance]）
function printDistancesMatrix(distances: Array<Array<Move>>): void {
  for (let i: i32 = 0; i < distances.length; i++) {
    let rowStr = "Snake " + i.toString() + ": ";
    let row = distances[i];
    for (let j: i32 = 0; j < row.length; j++) {
      rowStr += "(" + row[j].direction.toString() + ", " + row[j].distance.toString() + ") ";
    }
    //trace(rowStr);
  }
}

/**
 * safeMove 根据当前蛇状态和棋盘信息，选择一个绝对安全的移动方向。
 *
 * @param snake 己蛇状态数组，长度为 8
 * @param boardSize 棋盘大小（坐标范围为 1 ~ boardSize）
 * @param barriers 障碍物坐标数组，每两个数字为一组
 * @returns 返回安全移动方向，如果没有安全方向，则返回 Direction.ERROR
 */
function safeMove(snake: Array<i32>, boardSize: i32, barriers: Array<i32>): i32 {
  // 定义四个方向，顺序与 Direction 枚举一致
  let dx = [0, -1, 0, 1];
  let dy = [1, 0, -1, 0];
  let headX = snake[0], headY = snake[1];

  for (let dir: Direction = 0; dir < 4; dir++) {
    let newHeadX = headX + dx[dir];
    let newHeadY = headY + dy[dir];

    // 检查是否越界
    if (newHeadX < 1 || newHeadX > boardSize || newHeadY < 1 || newHeadY > boardSize)
      continue;

    // 检查蛇体碰撞（这里只检测前三节，蛇尾可以留空，因为可能会移动）
    let collidesWithSelf = false;
    for (let i: i32 = 0; i < 6; i += 2) {
      if (newHeadX == snake[i] && newHeadY == snake[i + 1]) {
        collidesWithSelf = true;
        break;
      }
    }
    if (collidesWithSelf) continue;

    // 检查障碍物碰撞
    let collidesWithBarrier = false;
    for (let i: i32 = 0; i < barriers.length; i += 2) {
      if (newHeadX == barriers[i] && newHeadY == barriers[i + 1]) {
        collidesWithBarrier = true;
        break;
      }
    }
    if (collidesWithBarrier) continue;

    // 找到安全移动，返回该方向
    return dir;
  }
  // 如果没有找到任何安全方向，返回错误码
  return Direction.UP;
}

/**
 * 主函数：决定蛇的移动方式
 *
 * 参数说明：
 * - boardSize: 棋盘大小（棋盘为 boardSize×boardSize）
 * - snake: 己蛇坐标，长度为 8，依次为 蛇头、第二节、第三节、蛇尾（第四节）
 *          若 snake 为 (-1,-1)×4 则视为己蛇已死亡，返回默认值
 * - snakeNum: 其他蛇数量
 * - otherSnakes: 其他蛇坐标数组，长度为 snakeNum×8
 * - foodNum: 果子数量
 * - foods: 果子坐标数组，长度为 foodNum×2，每对坐标依次表示 [果子_x, 果子_y]
 * - round: 剩余回合数（本次决策后减一）
 *
 * 返回值：
 * 如果找到有效目标，则返回 [方向, 距离, 果子_x, 果子_y]，
 * 否则返回 [-1, -1]
 */
export function greedy_snake_step(
    boardSize: i32,
    snake: Array<i32>,
    snakeNum: i32,
    otherSnakes: Array<i32>,
    foodNum: i32,
    foods: Array<i32>,
    round: i32
): i32 {
  // 己蛇若已死亡，直接返回
  if (
      snake[0] == -1 && snake[1] == -1 &&
      snake[2] == -1 && snake[3] == -1 &&
      snake[4] == -1 && snake[5] == -1 &&
      snake[6] == -1 && snake[7] == -1
  ) {
    return 0;
  }
  // 组装所有蛇：下标 0 为己蛇，其余为其他蛇
  // 一个二维数组，存储所有的蛇坐标
  let allSnakes = new Array<Array<i32>>();
  allSnakes.push(snake);
  for (let i: i32 = 0; i < snakeNum; i++) {
    let s = new Array<i32>();
    for (let j: i32 = 0; j < 8; j++) {
      s.push(otherSnakes[i * 8 + j]);
    }
    allSnakes.push(s);
  }
  // 获取果子数组
  let fruits = new Array<fruit>();
  for (let f: i32 = 0; f < foodNum; f++) {
    let foodCoord = new Array<i32>(2);
    foodCoord[0] = foods[f * 2];
    foodCoord[1] = foods[f * 2 + 1];
    fruits.push(new fruit(f, foodCoord));
  }

  // 初始计算各蛇到所有果子的距离
  let distances = computeDistances(allSnakes, fruits, boardSize);
  // TODO：可以考虑设计一个distance类，存储距离和移动方式，避免重复计算

  // 迭代预测更新：当己蛇没有合适目标时，
  // 以其他蛇为主调用 candidateForSnake，记录它们选择的果子，然后更新距离

  // 思路：目标是找到一个离我蛇相对最近的果子，然后安全的像那里移动。一开始所有蛇的迭代次数都为1
  /*
      1. 计算所有蛇到果子的距离，如果我的蛇能够距离一个果子是最近的，那就很好了，直接返回
      2. 如果没有呢？我们用相同的做法处理所有其他蛇，可以得到其他蛇的候选果子（候选果子是距离本蛇排名为【迭代次数】的果子），标记有候选果子的蛇,他们的迭代次数+1
      3. 得到其他蛇的候选果子之后，我们可以确定他们回去到这个地方吃果子，因此可以我们选择候选果子更新所有有候选果子的蛇到其他果子的距离，（不要修改之前的候选果子）
      4. 这个时候进入下一轮迭代。

      5. 我们需要计算所有没有候选果子的蛇（当然包括自己的蛇）的候选果子，如果我的蛇有候选果子，返回
      6. 如果还是没有呢？我们用相同的做法处理所有其他蛇，可以得到其他蛇的候选果子（候选果子是最近果子），他们的迭代次数+1
      7. 然后需要更新。我们选择距离本蛇距离排名为【迭代次数】的果子来更新距离
      8. 这个时候进入下一轮迭代。

      9. 直到迭代次数达到20，或者产生一个有效的果子
      10. 如果没有有效的果子，返回一个safeMove

      example：
      （1，1）1 （2，2）3 （3，3）5
 */

  let maxIterations: i32 = 20;
  let iteration: i32 = 0;
  let iters_each_snake = new Array<i32>();
  for (let i: i32 = 0; i < allSnakes.length; i++) {
    iters_each_snake.push(0);
  }
  let cand_each_snake = new Array<Array<i32>>();// 存储每条蛇被候选过的果子，保证后续更新不会碰到他们
  // 初始化 cand_each_snake，每个蛇的候选数组初始化为空数组
  for (let i = 0; i < allSnakes.length; i++) {
    cand_each_snake[i] = new Array<i32>();
  }
  while (iteration < maxIterations) {
    // 先尝试己蛇（索引 0）的候选
    let candidate = candidateForSnake(0, distances, boardSize, snake, fruits, allSnakes, iters_each_snake[0]);
    if (candidate.move.direction != Direction.ERROR) {
      //trace("==========\n[DEBUG] 我的蛇找到有效候选 返回方向: " + candidate.move.direction.toString() +"\n==========\n");
      // 找到有效方案，返回 [方向, 距离, 果子_x, 果子_y]
      return candidate.move.direction;
    }
    // 己蛇没找到，则先查看其他蛇的选择（只考虑能选出方案的蛇）
    let otherCandidates = new Array<OtherCandidate>();
    for (let i: i32 = 1; i < allSnakes.length; i++) {
      let cand = candidateForSnake(i, distances, boardSize, allSnakes[i], fruits, allSnakes, iters_each_snake[i]);
      if (cand.move.direction != Direction.ERROR) {
        otherCandidates.push(new OtherCandidate(i, cand));
        cand_each_snake[i].push(cand.fruit.fruitIndex);
        iters_each_snake[i]++;
        //trace("\n==========\n[DEBUG]蛇找到有效候选，蛇索引: " + i.toString() + " 方向: " + cand.move.direction.toString() + "距离: " + cand.move.distance.toString() + "\n==========\n"); 
      }
    }
    if (otherCandidates.length == 0) {
      //trace("\n==========\n[DEBUG] 其他蛇均未找到候选\n怎会如此，真扫码了\n==========\n");
      // TODO: 结束程序，打印distances
      printDistancesMatrix(distances);
      break;
    }
    // 对于每个能选出目标的其他蛇，更新它们后续果子的距离
    for (let i: i32 = 0; i < otherCandidates.length; i++) {
      let snakeIdx = otherCandidates[i].snakeIndex;
      let chosenFruit = otherCandidates[i].candidate.fruit;
      let chosenCoord = chosenFruit.fruitCoord;
      for (let f: i32 = 0; f < foodNum; f++) {
        for (let j: i32 = 0; j < cand_each_snake[snakeIdx].length; j++) {
          if (cand_each_snake[snakeIdx][j] == f) {
            // 该果子已经被选中，跳过
            continue;
          }
        }
        if (distances[snakeIdx][f].distance != 1000) {
          let otherCoord = new Array<i32>(2);
          otherCoord[0] = i32(foods[f * 2]);
          otherCoord[1] = i32(foods[f * 2 + 1]);
          distances[snakeIdx][f].distance = distances[snakeIdx][f].distance + manhattan(chosenCoord, otherCoord);
        }
      }
    }
    // 避免己蛇重复选到其他蛇已选的果子，减少重复运算
    for (let i: i32 = 0; i < otherCandidates.length; i++) {
      let chosenFruit = otherCandidates[i].candidate.fruit.fruitIndex;
      distances[0][chosenFruit].distance = 1000;
    }
    iteration++;
  }

  return safeMove(snake, boardSize, getObstaclesForSnake(0, allSnakes));
}