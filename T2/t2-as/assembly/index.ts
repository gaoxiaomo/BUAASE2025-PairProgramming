/**
 * 决定蛇的移动方式，考虑障碍物
 * @param snake 四个蛇身坐标，长度为8，顺序为：蛇头、第二节、第三节、蛇尾（即第四节）
 * @param fruit 果子的坐标，长度为2：[果子_x, 果子_y]
 * @param barriers 障碍物坐标，每两个数字为一个障碍，共12个障碍，总长度为24
 * @returns 若可达，返回 0、1、2、3 中的一个（分别代表上、左、下、右）；若不可达，返回 -1
 */
export function greedySnakeMoveBarriers(snake: number[], fruit: number[], barriers: number[]): number {
  // 用队列实现 BFS 搜索
  // 队列中每个元素是长度为10的数组：[蛇头x, 蛇头y, 第二节x, 第二节y, 第三节x, 第三节y, 第四节x, 第四节y, firstMove, depth]
  const queue: Array<i32[]> = [];

  const visited: Set<string> = new Set();

  // 辅助函数：生成状态的 key，仅使用蛇身坐标部分
  function stateKey(snakeArr: i32[]): string {
    return snakeArr.slice(0, 8).join(",");
  }

  const initState = new Array<i32>(10);
  for (let i = 0; i < 8; i++) {
    initState[i] = snake[i] as i32;
  }
  initState[8] = -1; // 第一步移动方向，初始为-1
  initState[9] = 0;  // 深度，初始为0

  queue.push(initState);
  visited.add(stateKey(initState));

  const dx: i32[] = [0, -1, 0, 1];
  const dy: i32[] = [1, 0, -1, 0];

  // BFS 搜索：最多扩展 200 回合
  while (queue.length > 0) {
    const current = queue.shift();
    const depth = current[9];
    const firstMove = current[8];

    if (depth >= 200) continue;

    //蛇头
    const headX = current[0];
    const headY = current[1];

    // 枚举四个可能的移动方向：0-上，1-左，2-下，3-右
    for (let dir = 0; dir < 4; dir++) {
      const newHeadX = headX + dx[dir];
      const newHeadY = headY + dy[dir];

      // 不越界
      if (newHeadX < 1 || newHeadX > 8 || newHeadY < 1 || newHeadY > 8) continue;

      // 检查是否撞到障碍物
      let hitBarrier = false;
      for (let i = 0; i < barriers.length; i += 2) {
        if (newHeadX === barriers[i] as i32 && newHeadY === barriers[i + 1] as i32) {
          hitBarrier = true;
          break;
        }
      }
      if (hitBarrier) continue;

      // 蛇体碰撞检查：
      let hitSnake = false;
      for (let i = 0; i < 6; i += 2) {
        if (newHeadX === current[i] && newHeadY === current[i + 1]) {
          hitSnake = true;
          break;
        }
      }
      if (hitSnake) continue;

      const newSnake = new Array<i32>(10);
      newSnake[0] = newHeadX;
      newSnake[1] = newHeadY;
      // 复制原蛇的前6个坐标（前3节）到新蛇的2-7位置
      for (let i = 0; i < 6; i++) {
        newSnake[i + 2] = current[i];
      }

      newSnake[8] = (firstMove === -1 ? dir : firstMove);
      newSnake[9] = depth + 1;

      //可达路径，返回最初的移动方向
      if (newHeadX === fruit[0] as i32 && newHeadY === fruit[1] as i32) {
        return newSnake[8];
      }

      // 如果新状态未曾访问过，则加入队列
      const key = stateKey(newSnake);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(newSnake);
      }
    }
  }

  // 为不可达，返回 -1
  return -1;
}