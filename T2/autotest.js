import assert from "assert";
// 这里引入你实现的函数，命名可按你风格选择
import { greedySnakeMoveBarriers } from "./build/release.js";
// 若你的导出名称不同，可修改为：import { greedy_snake_move_barriers as greedySnakeMoveBarriers } from "…"

// 辅助函数：生成随机整数（闭区间）
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成一个合法的蛇：蛇由 4 节组成，四节身体连续且不重叠
function generateRandomSnake() {
    // 随机选取一个起点
    const startX = getRandomInt(2, 7);
    const startY = getRandomInt(2, 7);
    // 随机选择一个方向（上下左右），保证蛇后续不会出界
    const directions = [
        { dx: 0, dy: 1 },   // 上
        { dx: -1, dy: 0 },  // 左
        { dx: 0, dy: -1 },  // 下
        { dx: 1, dy: 0 }    // 右
    ];
    let dir = directions[getRandomInt(0, directions.length - 1)];

    // 构造蛇（蛇头在数组前面）
    const snake = [];
    snake.push(startX, startY);
    // 后续三节：保证与前一节相邻
    for (let i = 1; i < 4; i++) {
        let newX = snake[(i - 1) * 2] - dir.dx;
        let newY = snake[(i - 1) * 2 + 1] - dir.dy;
        // 如果越界，则重新生成整个蛇
        if (newX < 1 || newX > 8 || newY < 1 || newY > 8) {
            return generateRandomSnake();
        }
        snake.push(newX, newY);
    }
    return snake;
}

// 生成果子，保证果子不在蛇身上
function generateRandomFood(snake) {
    while (true) {
        let fx = getRandomInt(1, 8);
        let fy = getRandomInt(1, 8);
        let conflict = false;
        for (let i = 0; i < snake.length; i += 2) {
            if (snake[i] === fx && snake[i + 1] === fy) {
                conflict = true;
                break;
            }
        }
        if (!conflict) return [fx, fy];
    }
}

// 生成障碍物：总共 12 个障碍物，保证它们不与蛇和果子重叠
function generateRandomBarriers(snake, food) {
    const barrierSet = new Set();
    // 将蛇和果子所在的位置先加入排除集合（格式 "x,y"）
    for (let i = 0; i < snake.length; i += 2) {
        barrierSet.add(snake[i] + "," + snake[i + 1]);
    }
    barrierSet.add(food[0] + "," + food[1]);

    const barriers = [];
    while (barriers.length < 24) {
        let x = getRandomInt(1, 8);
        let y = getRandomInt(1, 8);
        let key = x + "," + y;
        if (!barrierSet.has(key)) {
            barrierSet.add(key);
            barriers.push(x, y);
        }
    }
    return barriers;
}

// 辅助函数：用 BFS 判断在当前配置下，蛇头是否有路径到达果子（考虑障碍与蛇身）
// 注意：这里简单地把蛇身（除蛇头外）和障碍都视为障碍物
function isReachable(snake, food, barriers) {
    const board = 8;
    const dirs = [[0,1],[-1,0],[0,-1],[1,0]];   // 上左下右
    const key = s => s.join();                   // 8 个数字做键
  
    const obsSet = new Set();                    // 固定障碍
    for (let i = 0; i < barriers.length; i += 2)
      obsSet.add(barriers[i] + ',' + barriers[i+1]);
  
    const q = [ [...snake] ];                    // 队列存完整蛇身
    const vis = new Set([key(snake)]);
  
    while (q.length) {
      const cur = q.shift();                     // [hx,hy,nx,ny,...,tx,ty]
      const [hx, hy] = cur;
  
      if (hx === food[0] && hy === food[1]) return true;
  
      for (const [dx, dy] of dirs) {
        const nx = hx + dx, ny = hy + dy;
        if (nx < 1 || nx > board || ny < 1 || ny > board) continue;
        if (obsSet.has(nx + ',' + ny)) continue;
  
        // 不能撞到除尾巴外的身体
        let hit = false;
        for (let i = 0; i < 6; i += 2) {
          if (nx === cur[i] && ny === cur[i+1]) { hit = true; break; }
        }
        if (hit) continue;
  
        // 生成下一状态：头前进，身体整体后移，尾巴腾出
        const nxt = [nx, ny, ...cur.slice(0, 6)];
        const k = key(nxt);
        if (!vis.has(k)) { vis.add(k); q.push(nxt); }
      }
    }
    return false;   // 搜完仍到不了
  }

/**
 * 自动测试函数
 * 生成随机样例，然后判断样例是否可达（使用 BFS），
 * 若可达，则 access = 1，期望 greedySnakeMoveBarriers 经过若干回合吃到果子（返回正数步数）；
 * 若不可达，则 access = 0，期望 greedySnakeMoveBarriers 在第一回合返回 -1。
 */
function runAutoTests(testCount = 10) {
    let passCount = 0;
    for (let i = 1; i <= testCount; i++) {
        const snake = generateRandomSnake();
        const food = generateRandomFood(snake);
        const barriers = generateRandomBarriers(snake, food);
        // 用 BFS 判断可达性
        const reachable = isReachable(snake, food, barriers);
        // 当样例可达时，我们希望函数模拟走法最终吃到果子，返回正数回合数；
        // 不可达时，我们希望在第一回合就返回 -1。
        const access = reachable ? 1 : 0;
        const result = greedy_snake_barriers_checker(snake, 1, food, barriers, access);
        // 输出样例信息及测试结果
        console.log(`Test ${i}:`);
        console.log(`  Snake:   ${JSON.stringify(snake)}`);
        console.log(`  Food:    ${JSON.stringify(food)}`);
        console.log(`  Barriers:${JSON.stringify(barriers)}`);
        console.log(`  Reachable? ${reachable}`);
        console.log(`  Checker result: ${result}`);
        
        // 如果可达，要求返回值 > 0；不可达则应返回 -1（或其他约定的标记值，根据你的规则）
        if (reachable) {
            if (result > 0) {
                console.log("  PASS\n");
                passCount++;
            } else {
                console.log("  FAIL\n");
            }
        } else {
            if (result === -1) {
                console.log("  PASS\n");
                passCount++;
            } else {
                console.log("  FAIL\n");
            }
        }
    }
    console.log(`Passed ${passCount} / ${testCount} tests.`);
}

/* 
注意：上面测试代码依赖于你实现的 greedySnakeMoveBarriers (或相似名称) 函数，
以及 greedy_snake_barriers_checker() 函数（下文给出的版本），例如：
*/
function greedy_snake_barriers_checker(initial_snake, food_num, foods, barriers, access) {
    if (initial_snake.length !== 8) throw "Invalid snake length";
    
    let current_snake = [...initial_snake];
    let current_foods = [...foods];
    const barriers_list = [];
    for (let i = 0; i < barriers.length; i += 2) {
        const x = barriers[i];
        const y = barriers[i + 1];
        if (x !== -1 && y !== -1) {
            barriers_list.push({ x, y });
        }
    }
    let turn = 1;

    while (turn <= 200) {
        const direction = greedySnakeMoveBarriers(current_snake, current_foods, barriers);

        if (access === 0) {
            if (direction !== -1) {
                return -5; // 当预期不可达时，若函数返回了可行方向则出错
            } else {
                return 1;
            }
        }

        // 检查返回的方向是否在合法区间
        if (direction < 0 || direction > 3) return -4; 

        let new_snake = [
            current_snake[0] + (direction === 3 ? 1 : 0) - (direction === 1 ? 1 : 0),
            current_snake[1] + (direction === 0 ? 1 : 0) - (direction === 2 ? 1 : 0),
            current_snake[0],
            current_snake[1],
            current_snake[2],
            current_snake[3],
            current_snake[4],
            current_snake[5],
        ];

        // 出界
        if (new_snake[0] < 1 || new_snake[0] > 8 || new_snake[1] < 1 || new_snake[1] > 8) return -1;

        // 碰到障碍物
        if (barriers_list.some(ob => ob.x === new_snake[0] && ob.y === new_snake[1])) return -2;

        // 吃到果子
        let ate_index = -1;
        for (let i = 0; i < current_foods.length; i += 2) {
            if (new_snake[0] === current_foods[i] && new_snake[1] === current_foods[i + 1]) {
                ate_index = i;
                break;
            }
        }
        
        if (ate_index !== -1) {
            current_foods.splice(ate_index, 2);
            food_num -= 1;
        }

        if (food_num === 0) {
            // 吃完所有果子
            return turn; 
        }
        
        current_snake = new_snake;
        turn++;
    }
    
    // 超过 200 回合没有吃到果子，则判定超时
    return -3; 
}

// 运行自动测试（例如生成 10 个测试样例）
runAutoTests(2000);