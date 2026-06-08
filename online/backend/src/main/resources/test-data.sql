-- 测试数据
-- 项目启动后在 IDEA Database 控制台执行

USE typing_practice;

-- 测试用户（密码都是 123456）
INSERT INTO users (username, password, nickname, total_practice_count, total_practice_seconds, best_wpm, best_accuracy, current_streak, longest_streak, total_checkin_days, created_at, updated_at)
VALUES
('test1', '123456', '打字新手', 15, 1800, 35, 92.5, 3, 5, 8, NOW(), NOW()),
('test2', '123456', '键盘达人', 42, 5400, 78, 98.2, 12, 15, 30, NOW(), NOW());

-- 测试练习记录
INSERT INTO practice_records (user_id, mode, difficulty, wpm, accuracy, duration_seconds, total_chars, correct_chars, error_count, created_at)
VALUES
(1, 'WORDS', 'BEGINNER', 25, 88.0, 120, 300, 264, 12, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, 'WORDS', 'BEGINNER', 28, 90.5, 120, 340, 308, 10, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'SENTENCE', 'INTERMEDIATE', 30, 91.0, 180, 540, 492, 14, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 'WORDS', 'BEGINNER', 32, 93.0, 120, 384, 357, 9, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'SENTENCE', 'INTERMEDIATE', 33, 92.5, 150, 495, 458, 11, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'ARTICLE', 'INTERMEDIATE', 35, 92.5, 300, 1050, 971, 25, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'WORDS', 'BEGINNER', 35, 94.0, 100, 350, 329, 7, NOW()),
(2, 'WORDS', 'INTERMEDIATE', 55, 95.0, 120, 660, 627, 15, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 'SENTENCE', 'ADVANCED', 65, 96.5, 180, 1170, 1129, 20, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(2, 'ARTICLE', 'ADVANCED', 72, 97.0, 300, 2160, 2095, 35, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'WORDS', 'EXPERT', 78, 98.2, 120, 936, 919, 10, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'ARTICLE', 'EXPERT', 75, 97.5, 300, 2250, 2194, 30, NOW());

-- 测试打卡记录
INSERT INTO check_ins (user_id, checkin_date, practice_count_today, total_seconds_today, best_wpm_today, streak_day, created_at)
VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 1, 120, 25, 1, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1, 120, 28, 2, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1, 180, 30, 3, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1, 120, 32, 4, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 150, 33, 5, NOW()),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 2, 400, 35, 6, NOW()),
(1, CURDATE(), 1, 100, 35, 7, NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 1, 120, 55, 1, NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 1, 180, 65, 2, NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 2, 420, 72, 3, NOW()),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1, 120, 78, 4, NOW()),
(2, CURDATE(), 1, 300, 75, 5, NOW());
