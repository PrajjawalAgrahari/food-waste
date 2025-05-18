package com.example.backend.foodItems;

import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FoodItemElasticsearchRepository extends ElasticsearchRepository<FoodItemDocument, String> {
}
