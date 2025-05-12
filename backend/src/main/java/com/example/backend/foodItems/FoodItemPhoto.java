package com.example.backend.foodItems;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.util.Date;

@Entity
@Table(name = "food_item_photos")
public class FoodItemPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItems foodItem;

    @Column(name = "url", nullable = false, columnDefinition = "TEXT")
    private String url;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Date uploadedAt;

    // Constructors
    public FoodItemPhoto() {
    }

    public FoodItemPhoto(FoodItems foodItem, String url) {
        this.foodItem = foodItem;
        this.url = url;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public FoodItems getFoodItem() {
        return foodItem;
    }

    public void setFoodItem(FoodItems foodItem) {
        this.foodItem = foodItem;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Date getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Date uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}