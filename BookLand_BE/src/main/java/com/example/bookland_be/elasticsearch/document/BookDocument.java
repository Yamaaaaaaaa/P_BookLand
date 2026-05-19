package com.example.bookland_be.elasticsearch.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.util.Set;

@Document(indexName = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String description;

    @Field(type = FieldType.Double)
    private Double originalCost;

    @Field(type = FieldType.Double)
    private Double sale;

    @Field(type = FieldType.Double)
    private Double finalPrice;

    @Field(type = FieldType.Integer)
    private Integer stock;

    @Field(type = FieldType.Keyword)
    private String status;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String bookImageUrl;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String authorName;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String publisherName;

    @Field(type = FieldType.Keyword)
    private Set<String> categories;
}
