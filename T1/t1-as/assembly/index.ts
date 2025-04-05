// AssemblyScript 实现的贪吃蛇移动决策函数
// 函数名：greedySnakeMove
// 参数：
//   snake: Int32Array，长度为8，依次为 [头_x, 头_y, 第二节_x, 第二节_y, 第三节_x, 第三节_y, 蛇尾_x, 蛇尾_y]
//   fruit: Int32Array，长度为2，[果子_x, 果子_y]
// 返回值：
//   i32 类型的数字，取值 0, 1, 2, 3 分别对应向上（+y）、向左（-x）、向下（-y）、向右（+x）
export function isOut(x:i32,y:i32):boolean {
  return x < 1 || x > 8 || y < 1 || y > 8;
}

export function isCrush(x1:i32,y1:i32,x2:i32,y2:i32): boolean {
  return x1 == x2 && y1 == y2;
}

export function greedy_snake_move(snake: Int32Array, fruit: Int32Array): i32 {
  let head_x: i32 = snake[0];
  let head_y: i32 = snake[1];

  // 获取果子坐标
  let fruit_x: i32 = fruit[0];
  let fruit_y: i32 = fruit[1];
  
  let diff_x = fruit_x - head_x;
  let diff_y = fruit_y - head_y;

  let move: i32 = 0;
  
  let nx: i32 = 0;
  if (diff_x < 0) {
    nx = -1;
    move = 1;
  }
  else if (diff_x == 0) {
    nx = 0;
  }
  else if (diff_x > 0) {
    nx = 1;
    move = 3;
  }

  let new_snake = [
    snake[0] + nx,
    snake[1],
    snake[0],
    snake[1],
    snake[2],
    snake[3],
    snake[4],
    snake[5],
  ];

  let out_x : boolean = isOut(new_snake[0],new_snake[1]);

  let crush_x : boolean = isCrush(new_snake[0] ,new_snake[1] ,new_snake[4] ,new_snake[5])

  if (nx != 0 && !out_x && !crush_x) {
    return move;
  }

  let ny: i32 = 0;

  if (diff_y < 0) {
    ny = -1;
    move = 2;
  }
  else if (diff_y == 0) {
    ny = 0;
  }
  else if (diff_y > 0) {
    ny = 1;
    move = 0;
  }

  new_snake = [
    snake[0],
    snake[1] + ny,
    snake[0],
    snake[1],
    snake[2],
    snake[3],
    snake[4],
    snake[5],
  ];

  let out_y : boolean = isOut(new_snake[0],new_snake[1]);

  let crush_y : boolean = isCrush(new_snake[0] ,new_snake[1] ,new_snake[4] ,new_snake[5])

  if (ny != 0 && !out_y && !crush_y ) {
    return move;
  }

  if (crush_x && ny == 0) {
    if (snake[1] + 1 > 8) {
      move = 2;
    }
    else {
      move = 0;
    }
  }
  if (crush_y && nx == 0) {
    if (snake[0] + 1 > 8) {
      move = 1
    }
    else {
      move = 3;
    }
  }
  
  return move;
}