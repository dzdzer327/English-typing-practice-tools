package com.typing.backend.repository;

import com.typing.backend.entity.PracticeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface PracticeRecordRepository extends JpaRepository<PracticeRecord, Long> {

    List<PracticeRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<PracticeRecord> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(r) FROM PracticeRecord r WHERE r.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(r.durationSeconds), 0) FROM PracticeRecord r WHERE r.user.id = :userId")
    Long sumDurationByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(r.wpm) FROM PracticeRecord r WHERE r.user.id = :userId")
    Integer findMaxWpmByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(r.accuracy) FROM PracticeRecord r WHERE r.user.id = :userId")
    Double findMaxAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(r.wpm), 0) FROM PracticeRecord r WHERE r.user.id = :userId")
    Double findAvgWpmByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(r.accuracy), 0) FROM PracticeRecord r WHERE r.user.id = :userId")
    Double findAvgAccuracyByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(r.totalChars), 0) FROM PracticeRecord r WHERE r.user.id = :userId")
    Long sumTotalCharsByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(r.correctChars), 0) FROM PracticeRecord r WHERE r.user.id = :userId")
    Long sumCorrectCharsByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(r.errorCount), 0) FROM PracticeRecord r WHERE r.user.id = :userId")
    Long sumErrorsByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT COUNT(DISTINCT DATE(r.created_at)) FROM practice_records r WHERE r.user_id = :userId",
            nativeQuery = true)
    Long countPracticeDaysByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM PracticeRecord r WHERE r.user.id = :userId AND r.createdAt >= :since")
    Long countByUserIdSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT r.mode, COUNT(r), COALESCE(AVG(r.wpm), 0), COALESCE(AVG(r.accuracy), 0) " +
            "FROM PracticeRecord r WHERE r.user.id = :userId GROUP BY r.mode")
    List<Object[]> findModeStats(@Param("userId") Long userId);

    @Query("SELECT r.difficulty, COUNT(r), COALESCE(AVG(r.wpm), 0), COALESCE(AVG(r.accuracy), 0) " +
            "FROM PracticeRecord r WHERE r.user.id = :userId GROUP BY r.difficulty")
    List<Object[]> findDifficultyStats(@Param("userId") Long userId);

    @Query(value = "SELECT DATE(r.created_at) as date, " +
           "ROUND(AVG(r.wpm)) as avgWpm, ROUND(AVG(r.accuracy), 1) as avgAccuracy, COUNT(*) as count " +
           "FROM practice_records r WHERE r.user_id = :userId AND r.created_at >= :since " +
           "GROUP BY DATE(r.created_at) ORDER BY date", nativeQuery = true)
    List<Object[]> findDailyStats(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}
