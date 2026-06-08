package com.typing.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "check_ins", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "checkin_date"})
})
public class CheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "checkin_date", nullable = false)
    private LocalDate checkinDate;

    @Column(name = "practice_count_today")
    private Integer practiceCountToday = 0;

    @Column(name = "total_seconds_today")
    private Integer totalSecondsToday = 0;

    @Column(name = "best_wpm_today")
    private Integer bestWpmToday = 0;

    @Column(name = "streak_day")
    private Integer streakDay = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getCheckinDate() { return checkinDate; }
    public void setCheckinDate(LocalDate checkinDate) { this.checkinDate = checkinDate; }

    public Integer getPracticeCountToday() { return practiceCountToday; }
    public void setPracticeCountToday(Integer practiceCountToday) { this.practiceCountToday = practiceCountToday; }

    public Integer getTotalSecondsToday() { return totalSecondsToday; }
    public void setTotalSecondsToday(Integer totalSecondsToday) { this.totalSecondsToday = totalSecondsToday; }

    public Integer getBestWpmToday() { return bestWpmToday; }
    public void setBestWpmToday(Integer bestWpmToday) { this.bestWpmToday = bestWpmToday; }

    public Integer getStreakDay() { return streakDay; }
    public void setStreakDay(Integer streakDay) { this.streakDay = streakDay; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
