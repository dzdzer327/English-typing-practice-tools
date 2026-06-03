package com.typing.backend.controller;

import com.typing.backend.dto.ApiResponse;
import com.typing.backend.dto.PracticeRecordRequest;
import com.typing.backend.entity.PracticeRecord;
import com.typing.backend.service.CheckInService;
import com.typing.backend.service.PracticeService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    private final PracticeService practiceService;
    private final CheckInService checkInService;

    public PracticeController(PracticeService practiceService, CheckInService checkInService) {
        this.practiceService = practiceService;
        this.checkInService = checkInService;
    }

    /**
     * 提交练习记录
     * POST /api/practice/record?userId=1
     */
    @PostMapping("/record")
    public ApiResponse<Map<String, Object>> saveRecord(
            @RequestParam Long userId,
            @Valid @RequestBody PracticeRecordRequest request) {
        try {
            PracticeRecord record = practiceService.saveRecord(userId, request);

            // 自动更新今日打卡数据
            checkInService.updateTodayCheckIn(userId, request.getWpm(), request.getDurationSeconds());

            Map<String, Object> data = new HashMap<>();
            data.put("recordId", record.getId());
            data.put("wpm", record.getWpm());
            data.put("accuracy", record.getAccuracy());
            data.put("message", "练习记录已保存");

            return ApiResponse.success(data);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 获取练习记录列表
     * GET /api/practice/records?userId=1&page=0&size=20
     */
    @GetMapping("/records")
    public ApiResponse<List<PracticeRecord>> getRecords(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<PracticeRecord> records = practiceService.getUserRecords(userId, page, size);
        return ApiResponse.success(records);
    }

    /**
     * 获取最近 N 天的记录
     * GET /api/practice/recent?userId=1&days=7
     */
    @GetMapping("/recent")
    public ApiResponse<List<PracticeRecord>> getRecentRecords(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "7") int days) {
        List<PracticeRecord> records = practiceService.getRecentRecords(userId, days);
        return ApiResponse.success(records);
    }

    /**
     * 获取每日统计
     * GET /api/practice/daily-stats?userId=1&days=30
     */
    @GetMapping("/daily-stats")
    public ApiResponse<List<Map<String, Object>>> getDailyStats(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "30") int days) {
        List<Map<String, Object>> stats = practiceService.getDailyStats(userId, days);
        return ApiResponse.success(stats);
    }

    /**
     * 获取练习总览
     * GET /api/practice/overview?userId=1
     */
    @GetMapping("/overview")
    public ApiResponse<Map<String, Object>> getOverview(@RequestParam Long userId) {
        Map<String, Object> overview = practiceService.getOverview(userId);
        return ApiResponse.success(overview);
    }
}
