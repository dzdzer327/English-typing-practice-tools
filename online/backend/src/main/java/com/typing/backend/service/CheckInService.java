package com.typing.backend.service;

import com.typing.backend.entity.CheckIn;
import com.typing.backend.entity.User;
import com.typing.backend.repository.CheckInRepository;
import com.typing.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class CheckInService {

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public CheckInService(CheckInRepository checkInRepository,
                          UserRepository userRepository,
                          UserService userService) {
        this.checkInRepository = checkInRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * 每日打卡
     * 规则：练习完成后自动打卡，每天只能打一次
     */
    @Transactional
    public Map<String, Object> checkIn(Long userId) {
        LocalDate today = LocalDate.now();

        // 检查今天是否已打卡
        Optional<CheckIn> existing = checkInRepository.findByUserIdAndCheckinDate(userId, today);
        if (existing.isPresent()) {
            Map<String, Object> result = new HashMap<>();
            result.put("alreadyCheckedIn", true);
            result.put("checkIn", existing.get());
            result.put("message", "今天已经打过卡了");
            return result;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 计算连续天数
        int streak = calculateStreak(userId, today);

        CheckIn checkIn = createCheckIn(user, today, streak);

        // 更新用户连续打卡天数
        userService.updateStreak(userId, streak);

        Map<String, Object> result = new HashMap<>();
        result.put("alreadyCheckedIn", false);
        result.put("checkIn", checkIn);
        result.put("streak", streak);
        result.put("message", "打卡成功！连续打卡 " + streak + " 天");

        return result;
    }

    /**
     * 练习后更新今日打卡数据
     */
    @Transactional
    public CheckIn updateTodayCheckIn(Long userId, int wpm, int durationSeconds) {
        LocalDate today = LocalDate.now();

        Optional<CheckIn> optional = checkInRepository.findByUserIdAndCheckinDate(userId, today);
        if (optional.isPresent()) {
            CheckIn checkIn = optional.get();
            checkIn.setPracticeCountToday(checkIn.getPracticeCountToday() + 1);
            checkIn.setTotalSecondsToday(checkIn.getTotalSecondsToday() + durationSeconds);
            if (wpm > checkIn.getBestWpmToday()) {
                checkIn.setBestWpmToday(wpm);
            }
            return checkInRepository.save(checkIn);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        int streak = calculateStreak(userId, today);
        CheckIn checkIn = createCheckIn(user, today, streak);
        checkIn.setPracticeCountToday(1);
        checkIn.setTotalSecondsToday(durationSeconds);
        checkIn.setBestWpmToday(wpm);
        CheckIn saved = checkInRepository.save(checkIn);
        userService.updateStreak(userId, streak);
        return saved;
    }

    private CheckIn createCheckIn(User user, LocalDate date, int streak) {
        CheckIn checkIn = new CheckIn();
        checkIn.setUser(user);
        checkIn.setCheckinDate(date);
        checkIn.setStreakDay(streak);
        return checkInRepository.save(checkIn);
    }

    /**
     * 计算连续打卡天数
     */
    private int calculateStreak(Long userId, LocalDate today) {
        // 检查昨天是否打卡
        LocalDate yesterday = today.minusDays(1);
        Optional<CheckIn> yesterdayCheckIn = checkInRepository.findByUserIdAndCheckinDate(userId, yesterday);

        if (yesterdayCheckIn.isPresent()) {
            // 昨天打了，连续天数 +1
            return yesterdayCheckIn.get().getStreakDay() + 1;
        } else {
            // 昨天没打，检查是否是第一次打卡
            Optional<CheckIn> lastCheckIn = checkInRepository.findTopByUserIdOrderByCheckinDateDesc(userId);
            if (lastCheckIn.isPresent() && lastCheckIn.get().getCheckinDate().equals(today)) {
                return lastCheckIn.get().getStreakDay();
            }
            return 1; // 重新开始
        }
    }

    /**
     * 获取打卡日历（某月）
     */
    public Map<String, Object> getCheckInCalendar(Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);

        List<CheckIn> checkIns = checkInRepository
                .findByUserIdAndCheckinDateBetweenOrderByCheckinDateDesc(userId, start, end);

        Set<String> checkInDates = new HashSet<>();
        List<Map<String, Object>> days = new ArrayList<>();
        for (CheckIn ci : checkIns) {
            checkInDates.add(ci.getCheckinDate().toString());
            days.add(toSummary(ci));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("month", month);
        result.put("checkInDates", checkInDates);
        result.put("days", days);
        result.put("totalDays", checkIns.size());

        return result;
    }

    /**
     * 获取打卡历史
     */
    public List<Map<String, Object>> getCheckInHistory(Long userId, int limit) {
        List<CheckIn> all = checkInRepository.findByUserIdOrderByCheckinDateDesc(userId);
        return all.subList(0, Math.min(limit, all.size())).stream()
                .map(this::toSummary)
                .toList();
    }

    /**
     * 获取打卡统计
     */
    public Map<String, Object> getCheckInStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Map<String, Object> stats = new HashMap<>();
        stats.put("currentStreak", user.getCurrentStreak());
        stats.put("longestStreak", user.getLongestStreak());
        stats.put("totalCheckinDays", user.getTotalCheckinDays());
        Optional<CheckIn> today = checkInRepository.findByUserIdAndCheckinDate(userId, LocalDate.now());
        stats.put("checkedInToday", today.isPresent());
        stats.put("today", today.map(this::toSummary).orElse(null));

        Optional<CheckIn> lastCheckIn = checkInRepository.findTopByUserIdOrderByCheckinDateDesc(userId);
        stats.put("lastCheckinDate", lastCheckIn.map(checkIn -> checkIn.getCheckinDate().toString()).orElse(null));

        return stats;
    }

    private Map<String, Object> toSummary(CheckIn checkIn) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", checkIn.getId());
        summary.put("checkinDate", checkIn.getCheckinDate().toString());
        summary.put("practiceCountToday", checkIn.getPracticeCountToday());
        summary.put("totalSecondsToday", checkIn.getTotalSecondsToday());
        summary.put("bestWpmToday", checkIn.getBestWpmToday());
        summary.put("streakDay", checkIn.getStreakDay());
        summary.put("createdAt", checkIn.getCreatedAt());
        return summary;
    }
}
