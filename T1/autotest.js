import { greedy_snake_move } from "./t1-as/build/release.js";

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成一个合法的蛇（头、身体2、身体3、尾），连续4格，方向随机
function generateSnake() {
    const directions = [
        [1, 0],  // 向右
        [-1, 0], // 向左
        [0, 1],  // 向上
        [0, -1]  // 向下
    ];

    while (true) {
        let startX = getRandomInt(1, 8);
        let startY = getRandomInt(1, 8);
        let dir = directions[getRandomInt(0, 3)];
        let snake = [[startX, startY]];
        let valid = true;

        for (let i = 1; i < 4; i++) {
            let nextX = snake[i - 1][0] - dir[0];
            let nextY = snake[i - 1][1] - dir[1];
            if (nextX < 1 || nextX > 8 || nextY < 1 || nextY > 8) {
                valid = false;
                break;
            }
            snake.push([nextX, nextY]);
        }

        if (valid) {
            return snake.flat();
        }
    }
}

// 生成一个果子，确保不在蛇身体上
function generateFood(snake) {
    while (true) {
        let fx = getRandomInt(1, 8);
        let fy = getRandomInt(1, 8);
        let overlap = false;
        for (let i = 0; i < 8; i += 2) {
            if (snake[i] === fx && snake[i + 1] === fy) {
                overlap = true;
                break;
            }
        }
        if (!overlap) {
            return [fx, fy];
        }
    }
}

// 原始函数：返回吃到果子所需的回合数，或 -1, -2, -3 表示失败原因
function greedy_snake_fn_checker(snake, food) {
    let now_snake = [...snake];
    let turn = 1;
    while (true) {
        let result = greedy_snake_move(now_snake, food);
        let new_snake = [
            now_snake[0] + (result === 3) - (result === 1),
            now_snake[1] + (result === 0) - (result === 2),
            now_snake[0],
            now_snake[1],
            now_snake[2],
            now_snake[3],
            now_snake[4],
            now_snake[5],
        ];
        if (new_snake[0] < 1 || new_snake[0] > 8 || new_snake[1] < 1 || new_snake[1] > 8) {
            return -1;
        }
        if (new_snake[0] === new_snake[4] && new_snake[1] === new_snake[5]) {
            return -2;
        }
        if (new_snake[0] === food[0] && new_snake[1] === food[1]) {
            return turn;
        }
        now_snake = [...new_snake];
        if (turn > 200) {
            return -3;
        }
        turn++;
    }
}

// 自动测试函数
function runTests(n = 2000) {
    for (let i = 1; i <= n; i++) {
        let snake = generateSnake();
        let food = generateFood(snake);
        let result = greedy_snake_fn_checker(snake, food);
        console.log(`Test ${i}:`);
        console.log(`  Snake: ${JSON.stringify(snake)}`);
        console.log(`  Food:  ${JSON.stringify(food)}`);
        console.log(`  Result: ${result}\n`);
        assert.strictEqual(result >= 0, true, `Test ${i} failed: Expected non-negative result, got ${result}`);
    }
}