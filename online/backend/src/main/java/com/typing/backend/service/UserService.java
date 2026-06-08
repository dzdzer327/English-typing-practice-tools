package com.typing.backend.service;

import com.typing.backend.dto.LoginRequest;
import com.typing.backend.dto.RegisterRequest;
import com.typing.backend.entity.User;
import com.typing.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 注册
     */
    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // 不加密，直接存储
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());

        return userRepository.save(user);
    }

    /**
     * 登录
     */
    public User login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        return user;
    }

    /**
     * 获取用户信息
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    /**
     * 更新用户统计数据
     */
    public void updateStats(Long userId, int wpm, double accuracy, int durationSeconds) {
        User user = getUserById(userId);

        user.setTotalPracticeCount(user.getTotalPracticeCount() + 1);
        user.setTotalPracticeSeconds(user.getTotalPracticeSeconds() + durationSeconds);

        if (wpm > user.getBestWpm()) {
            user.setBestWpm(wpm);
        }
        if (accuracy > user.getBestAccuracy()) {
            user.setBestAccuracy(accuracy);
        }

        userRepository.save(user);
    }

    /**
     * 更新打卡连续天数
     */
    public void updateStreak(Long userId, int currentStreak) {
        User user = getUserById(userId);
        user.setCurrentStreak(currentStreak);
        user.setTotalCheckinDays(user.getTotalCheckinDays() + 1);

        if (currentStreak > user.getLongestStreak()) {
            user.setLongestStreak(currentStreak);
        }

        userRepository.save(user);
    }

    /**
     * 获取用户摘要信息
     */
    public Map<String, Object> getUserSummary(Long userId) {
        User user = getUserById(userId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("id", user.getId());
        summary.put("username", user.getUsername());
        summary.put("nickname", user.getNickname());
        summary.put("totalPracticeCount", user.getTotalPracticeCount());
        summary.put("totalPracticeSeconds", user.getTotalPracticeSeconds());
        summary.put("bestWpm", user.getBestWpm());
        summary.put("bestAccuracy", user.getBestAccuracy());
        summary.put("currentStreak", user.getCurrentStreak());
        summary.put("longestStreak", user.getLongestStreak());
        summary.put("totalCheckinDays", user.getTotalCheckinDays());
        summary.put("createdAt", user.getCreatedAt());

        return summary;
    }
}
