-- 创建数据库
CREATE DATABASE IF NOT EXISTS typing_practice
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE typing_practice;

-- 注意：表结构由 JPA 自动创建（ddl-auto: update）
-- 以下仅供参考，不需要手动执行

/*
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    total_practice_count INT DEFAULT 0,
    total_practice_seconds BIGINT DEFAULT 0,
    best_wpm INT DEFAULT 0,
    best_accuracy DOUBLE DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    total_checkin_days INT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE TABLE practice_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    mode VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    wpm INT NOT NULL,
    accuracy DOUBLE NOT NULL,
    duration_seconds INT NOT NULL,
    total_chars INT,
    correct_chars INT,
    error_count INT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE check_ins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL,
    practice_count_today INT DEFAULT 0,
    total_seconds_today INT DEFAULT 0,
    best_wpm_today INT DEFAULT 0,
    streak_day INT DEFAULT 0,
    created_at DATETIME,
    UNIQUE KEY uk_user_date (user_id, checkin_date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
*/
