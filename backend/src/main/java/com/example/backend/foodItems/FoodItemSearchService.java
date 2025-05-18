package com.example.backend.foodItems;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class FoodItemSearchService {

  private final ElasticsearchOperations elasticsearchOperations;
  private final FoodItemElasticsearchRepository elasticsearchRepository;
  private final FoodItemRepository foodItemRepository;

  public FoodItemSearchService(
    ElasticsearchOperations elasticsearchOperations,
    FoodItemElasticsearchRepository elasticsearchRepository,
    FoodItemRepository foodItemRepository
  ) {
    this.elasticsearchOperations = elasticsearchOperations;
    this.elasticsearchRepository = elasticsearchRepository;
    this.foodItemRepository = foodItemRepository;
  }

  // Index a single food item
  public void indexFoodItem(FoodItems foodItem) {
    FoodItemDocument document = FoodItemDocument.fromEntity(foodItem);
    elasticsearchRepository.save(document);
  }

  // Index all food items
  public void indexAllFoodItems() {
    List<FoodItems> allItems = foodItemRepository.findAll();
    List<FoodItemDocument> documents = allItems
      .stream()
      .map(FoodItemDocument::fromEntity)
      .collect(Collectors.toList());
    elasticsearchRepository.saveAll(documents);
  }

  public List<String> getSuggestions(String prefix) {
    if (prefix == null || prefix.trim().isEmpty()) {
      return new ArrayList<>();
    }

    System.out.println("Prefix: " + prefix);

    // Create a wildcard query that matches the prefix
    Criteria criteria = new Criteria("name").startsWith(prefix);
    Query query = new CriteriaQuery(criteria);

    // Limit results to 5 suggestions
    query.setPageable(PageRequest.of(0, 5));

    SearchHits<FoodItemDocument> searchHits = elasticsearchOperations.search(
      query,
      FoodItemDocument.class
    );

    System.out.println("Search Hits: " + searchHits.getTotalHits());

    // Extract unique name suggestions
    return searchHits
      .stream()
      .map(hit -> hit.getContent().getName())
      .distinct()
      .collect(Collectors.toList());
  }

  // Search with fuzzy matching for typo tolerance
  public List<FoodItems> searchWithFuzzy(String searchTerm) {
    if (searchTerm == null || searchTerm.trim().isEmpty()) {
      return new ArrayList<>();
    }

    // Create a fuzzy query that allows for typos
    Criteria criteria = new Criteria()
      .or(new Criteria("name").fuzzy(searchTerm))
      .or(new Criteria("pickupLocation").fuzzy(searchTerm));

    Query searchQuery = new CriteriaQuery(criteria);
    SearchHits<FoodItemDocument> searchHits = elasticsearchOperations.search(
      searchQuery,
      FoodItemDocument.class
    );

    // Extract IDs and fetch from repository
    List<Long> itemIds = searchHits
      .stream()
      .map(hit -> Long.parseLong(hit.getContent().getId()))
      .collect(Collectors.toList());

    if (itemIds.isEmpty()) {
      return new ArrayList<>();
    }

    return foodItemRepository.findAllById(itemIds);
  }

  // Search with combined filters (name/location, expiry soon, donor)
  public List<FoodItems> searchWithCombinedFilters(
    String searchTerm,
    boolean expiringSoon,
    Long donorId
  ) {
    // Start with a criteria that will match all documents
    Criteria criteria = new Criteria();

    // Add search term criteria if provided
    if (searchTerm != null && !searchTerm.trim().isEmpty()) {
      // Split the search term into individual words
      String[] searchWords = searchTerm.trim().split("\\s+");

      Criteria nameCriteria = null;
      Criteria locationCriteria = null;

      // Create criteria for each word
      for (String word : searchWords) {
        if (word.isEmpty()) continue;

        // For name field (with boost)
        if (nameCriteria == null) {
          nameCriteria = new Criteria("name").boost(2.0f).contains(word);
        } else {
          nameCriteria = nameCriteria.and(new Criteria("name").contains(word));
        }

        // For location field
        if (locationCriteria == null) {
          locationCriteria = new Criteria("pickupLocation").contains(word);
        } else {
          locationCriteria =
            locationCriteria.and(new Criteria("pickupLocation").contains(word));
        }
      }

      // Combine name and location criteria with OR
      if (nameCriteria != null) {
        criteria = nameCriteria;

        if (locationCriteria != null) {
          criteria = criteria.or(locationCriteria);
        }
      } else if (locationCriteria != null) {
        criteria = locationCriteria;
      }
    }

    // Add expiry soon filter if enabled (items expiring within 3 days)
    if (expiringSoon) {
      Criteria expiryCriteria = new Criteria("expiryDate")
        .between(
          new Date(), // today
          new Date(System.currentTimeMillis() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        );

      // If we already have criteria, add this as an AND condition
      if (criteria.getField() != null) {
        criteria = criteria.and(expiryCriteria);
      } else {
        criteria = expiryCriteria;
      }
    }

    // Add donor filter if provided
    if (donorId != null) {
      // If we already have criteria, add this as an AND condition
      if (criteria.getField() != null) {
        criteria = criteria.and(new Criteria("donorId").is(donorId));
      } else {
        criteria = new Criteria("donorId").is(donorId);
      }
    }

    // Create and execute the query
    Query searchQuery = new CriteriaQuery(criteria);
    SearchHits<FoodItemDocument> searchHits = elasticsearchOperations.search(
      searchQuery,
      FoodItemDocument.class
    );

    // Extract IDs and fetch from repository
    List<Long> itemIds = searchHits
      .stream()
      .map(hit -> Long.parseLong(hit.getContent().getId()))
      .collect(Collectors.toList());

    if (itemIds.isEmpty()) {
      return new ArrayList<>();
    }

    return foodItemRepository.findAllById(itemIds);
  }
}
