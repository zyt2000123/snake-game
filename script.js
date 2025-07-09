class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeGame() {
        this.drawGame();
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && e.code !== 'Space') return;
            
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    if (this.dy !== 1) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    if (this.dy !== -1) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    if (this.dx !== 1) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    if (this.dx !== -1) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('up').addEventListener('click', () => {
            if (this.gameRunning && this.dy !== 1) {
                this.dx = 0;
                this.dy = -1;
            }
        });
        
        document.getElementById('down').addEventListener('click', () => {
            if (this.gameRunning && this.dy !== -1) {
                this.dx = 0;
                this.dy = 1;
            }
        });
        
        document.getElementById('left').addEventListener('click', () => {
            if (this.gameRunning && this.dx !== 1) {
                this.dx = -1;
                this.dy = 0;
            }
        });
        
        document.getElementById('right').addEventListener('click', () => {
            if (this.gameRunning && this.dx !== -1) {
                this.dx = 1;
                this.dy = 0;
            }
        });
        
        // 游戏控制按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    drawGame() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#48bb78';
            } else {
                // 蛇身
                this.ctx.fillStyle = '#68d391';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 添加蛇头眼睛
            if (index === 0) {
                this.ctx.fillStyle = '#2d3748';
                const eyeSize = 3;
                const eyeOffset = 6;
                
                if (this.dx === 1) { // 向右
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset + 6, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + eyeOffset + 6, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.dx === -1) { // 向左
                    this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else if (this.dy === -1) { // 向上
                    this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                } else if (this.dy === 1) { // 向下
                    this.ctx.fillRect(segment.x * this.gridSize + 4, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                } else { // 默认向右
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 4, eyeSize, eyeSize);
                    this.ctx.fillRect(segment.x * this.gridSize + 12, segment.y * this.gridSize + 12, eyeSize, eyeSize);
                }
            }
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#f56565';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
        
        // 添加食物光泽效果
        this.ctx.fillStyle = '#feb2b2';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2 - 3,
            this.food.y * this.gridSize + this.gridSize / 2 - 3,
            3,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }
    
    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameInterval);
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('high-score').textContent = this.highScore;
        }
        
        // 添加游戏结束动画
        this.canvas.classList.add('game-over');
        setTimeout(() => {
            this.canvas.classList.remove('game-over');
        }, 500);
        
        alert(`游戏结束！\n得分: ${this.score}\n最高分: ${this.highScore}`);
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        
        // 如果蛇没有移动方向，设置默认向右
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
            this.dy = 0;
        }
        
        this.gameInterval = setInterval(() => {
            if (!this.gamePaused) {
                this.moveSnake();
                this.drawGame();
            }
        }, 150);
    }
    
    togglePause() {
        if (!this.gameRunning) {
            this.startGame();
            return;
        }
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            // 显示暂停提示
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏暂停', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('按空格键继续', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
    
    resetGame() {
        clearInterval(this.gameInterval);
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{x: 10, y: 10}];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.updateDisplay();
        this.drawGame();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});