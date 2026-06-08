package com.typing.backend.service;

import com.typing.backend.dto.PracticeRecordRequest;
import com.typing.backend.entity.PracticeRecord;
import com.typing.backend.entity.User;
import com.typing.backend.repository.PracticeRecordRepository;
import com.typing.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PracticeService {

    private final PracticeRecordRepository practiceRecordRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public PracticeService(PracticeRecordRepository practiceRecordRepository,
                           UserRepository userRepository,
                           UserService userService) {
        this.practiceRecordRepository = practiceRecordRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /**
     * 保存练习记录
     */
    @Transactional
    public PracticeRecord saveRecord(Long userId, PracticeRecordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        PracticeRecord record = new PracticeRecord();
        record.setUser(user);
        record.setMode(request.getMode());
        record.setDifficulty(request.getDifficulty());
        record.setWpm(request.getWpm());
        record.setAccuracy(request.getAccuracy());
        record.setDurationSeconds(request.getDurationSeconds());
        record.setTotalChars(request.getTotalChars());
        record.setCorrectChars(request.getCorrectChars());
        record.setErrorCount(request.getErrorCount());

        // 更新用户统计
        userService.updateStats(userId, request.getWpm(), request.getAccuracy(), request.getDurationSeconds());

        return practiceRecordRepository.save(record);
    }

    /**
     * 获取用户练习记录（分页）
     */
    public List<PracticeRecord> getUserRecords(Long userId, int page, int size) {
        List<PracticeRecord> all = practiceRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int start = page * size;
        int end = Math.min(start + size, all.size());

        if (start >= all.size()) {
            return Collections.emptyList();
        }
        return all.subList(start, end);
    }

    /**
     * 获取最近 N 天的练习记录
     */
    public List<PracticeRecord> getRecentRecords(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return practiceRecordRepository.findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                userId, since, LocalDateTime.now());
    }

    /**
     * 获取每日统计数据
     */
    public List<Map<String, Object>> getDailyStats(Long userId, int days) {
        LocalDate startDate = LocalDate.now().minusDays(Math.max(days - 1, 0));
        LocalDateTime since = startDate.atStartOfDay();
        List<Object[]> rows = practiceRecordRepository.findDailyStats(userId, since);

        Map<String, Map<String, Object>> byDate = new HashMap<>();
        for (Object[] row : rows) {
            String date = row[0].toString();
            Map<String, Object> stat = new HashMap<>();
            stat.put("date", date);
            stat.put("avgWpm", Math.round(((Number) row[1]).doubleValue()));
            stat.put("avgAccuracy", Math.round(((Number) row[2]).doubleValue() * 10.0) / 10.0);
            stat.put("count", ((Number) row[3]).longValue());
            byDate.put(date, stat);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate date = startDate.plusDays(i);
            String key = date.toString();
            result.add(byDate.getOrDefault(key, emptyDailyStat(key)));
        }
        return result;
    }

    /**
     * 获取用户练习总览
     */
    public Map<String, Object> getOverview(Long userId) {
        Map<String, Object> overview = new HashMap<>();
        Long totalRecords = practiceRecordRepository.countByUserId(userId);
        Long totalSeconds = practiceRecordRepository.sumDurationByUserId(userId);
        Long totalChars = practiceRecordRepository.sumTotalCharsByUserId(userId);
        Long correctChars = practiceRecordRepository.sumCorrectCharsByUserId(userId);
        Long errorCount = practiceRecordRepository.sumErrorsByUserId(userId);
        Double averageWpm = practiceRecordRepository.findAvgWpmByUserId(userId);
        Double averageAccuracy = practiceRecordRepository.findAvgAccuracyByUserId(userId);

        overview.put("totalRecords", totalRecords);
        overview.put("totalSeconds", totalSeconds);
        overview.put("bestWpm", defaultInt(practiceRecordRepository.findMaxWpmByUserId(userId)));
        overview.put("bestAccuracy", defaultDouble(practiceRecordRepository.findMaxAccuracyByUserId(userId)));
        overview.put("averageWpm", Math.round(defaultDouble(averageWpm)));
        overview.put("averageAccuracy", Math.round(defaultDouble(averageAccuracy) * 10.0) / 10.0);
        overview.put("totalChars", totalChars);
        overview.put("correctChars", correctChars);
        overview.put("errorCount", errorCount);
        overview.put("practiceDays", practiceRecordRepository.countPracticeDaysByUserId(userId));
        overview.put("todayRecords", practiceRecordRepository.countByUserIdSince(userId, LocalDate.now().atStartOfDay()));
        overview.put("overallAccuracy", totalChars > 0
                ? Math.round((correctChars * 1000.0 / totalChars)) / 10.0
                : 0.0);
        overview.put("modeStats", toGroupedStats(practiceRecordRepository.findModeStats(userId)));
        overview.put("difficultyStats", toGroupedStats(practiceRecordRepository.findDifficultyStats(userId)));
        return overview;
    }

    private Map<String, Object> emptyDailyStat(String date) {
        Map<String, Object> stat = new HashMap<>();
        stat.put("date", date);
        stat.put("avgWpm", 0);
        stat.put("avgAccuracy", 0.0);
        stat.put("count", 0L);
        return stat;
    }

    private List<Map<String, Object>> toGroupedStats(List<Object[]> rows) {
        List<Map<String, Object>> stats = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("name", row[0].toString());
            stat.put("count", ((Number) row[1]).longValue());
            stat.put("avgWpm", Math.round(((Number) row[2]).doubleValue()));
            stat.put("avgAccuracy", Math.round(((Number) row[3]).doubleValue() * 10.0) / 10.0);
            stats.add(stat);
        }
        return stats;
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }

    private double defaultDouble(Double value) {
        return value == null ? 0.0 : value;
    }
}
