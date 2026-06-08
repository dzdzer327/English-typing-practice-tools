package com.typing.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(length = 100)
    private String nickname;

    @Column(name = "total_practice_count")
    private Integer totalPracticeCount = 0;

    @Column(name = "total_practice_seconds")
    private Long totalPracticeSeconds = 0L;

    @Column(name = "best_wpm")
    private Integer bestWpm = 0;

    @Column(name = "best_accuracy")
    private Double bestAccuracy = 0.0;

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Column(name = "longest_streak")
    private Integer longestStreak = 0;

    @Column(name = "total_checkin_days")
    private Integer totalCheckinDays = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public Integer getTotalPracticeCount() { return totalPracticeCount; }
    public void setTotalPracticeCount(Integer totalPracticeCount) { this.totalPracticeCount = totalPracticeCount; }

    public Long getTotalPracticeSeconds() { return totalPracticeSeconds; }
    public void setTotalPracticeSeconds(Long totalPracticeSeconds) { this.totalPracticeSeconds = totalPracticeSeconds; }

    public Integer getBestWpm() { return bestWpm; }
    public void setBestWpm(Integer bestWpm) { this.bestWpm = bestWpm; }

    public Double getBestAccuracy() { return bestAccuracy; }
    public void setBestAccuracy(Double bestAccuracy) { this.bestAccuracy = bestAccuracy; }

    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }

    public Integer getTotalCheckinDays() { return totalCheckinDays; }
    public void setTotalCheckinDays(Integer totalCheckinDays) { this.totalCheckinDays = totalCheckinDays; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
