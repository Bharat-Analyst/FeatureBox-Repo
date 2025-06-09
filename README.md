# **FeatureBox AI Proof of Concept**
## Current Objectives

- **UPC Input & Search (High Priority):** Allow entry of a UPC code (and optionally, brand/product name/attributes).
Validate format and provide user feedback for invalid inputs.
- **Similarity Search Module (High Priority):** Connect to commercial datasets (SPINS/Nielsen, or equivalent) via read-only integration/API.
Retrieve and display a ranked list of look-alike products based on attribute similarity to the input UPC.
Show similarity scores and key matching attributes (category, brand, region).


---


## Notes
- Since we do not yet have access to the SPINS/Nielsen datasets, a mock dataset (~100 rows) with the following attributes was created.
      "product_key",
      "department_tag",
      "category_tag",
      "subcategory_tag",
      "market_key",
      "Geography",
      "Description",
      "Time Period",
      "Time Period End Date",
      "UPC",
      "Department",
      "Category",
      "Subcategory",
      "Brand",
      "Product Universe",
      "Product Level",
      "Attributes"
- This proof of concept uses the gemini-2.0-flash, but this can be updated to a more advanced Gemini LLM model if needed


## Gemini Wrapper
```python
import google.generativeai as genai
import pandas as pd


genai.configure(api_key="AIzaSyDkE1qb5anb68m3j4szVd0RLDxE1yhMHzM")

def get_similar_products_from_gemini(input_data: dict, df: pd.DataFrame, top_k: int = 5) -> list:
    """
    Uses Gemini to find similar products based on input attributes and description.

    input_data: dict with keys like 'UPC', 'Brand', 'Description', 'Attributes'
    df: pandas DataFrame with CPG product data
    top_k: number of similar products to return

    Returns:
        A list of ranked product dicts with similarity reasons.
    """


    product_rows = df.to_dict(orient='records')
    model = genai.GenerativeModel("gemini-2.0-flash") # Can change to use more advanced model

    # Gemini prompt
    prompt = f"""
You are an intelligent assistant for a CPG product similarity tool.
Given an input product with these details:
- UPC: {input_data.get('UPC', 'N/A')}
- Brand: {input_data.get('Brand', '')}
- Description: {input_data.get('Description', '')}
- Attributes: {input_data.get('Attributes', '')}

Your goal is to identify the {top_k} most similar products from the dataset below based on matching:
- Category
- Subcategory
- Brand
- Region (Geography)
- Product Description and Attributes (semantic similarity)

Return a list of dictionaries with keys:
- 'Description'
- 'UPC'
- 'Brand'
- 'Category'
- 'Subcategory'
- 'Geography'
- 'Attributes'
- 'Similarity Score' (from 0 to 100)
- 'Matching Factors' (e.g., 'Same Brand', 'Similar Attributes', etc.)

Dataset: {product_rows}
Only return the final answer as a JSON-formatted list.
    """

    response = model.generate_content(prompt)
    try:
        return eval(response.text.strip())
    except Exception as e:
        print("Error parsing Gemini response:", e)
        print(response.text)
        return []
```

## Sample input product for testing
```python
input_product = {
    "UPC": "012345678901",
    "Brand": "Kind",
    "Description": "Kind Organic Soy Milk Unsweetened 32oz",
    "Attributes": "Gluten-Free, High-Protein, Low Sugar"
}

results = get_similar_products_from_gemini(input_product, df)

for r in results:
    print(f"{r['Description']} — {r['Similarity Score']}% match — Factors: {', '.join(r['Matching Factors'])}")
```
## JSON Output
    2025-06-08 06:33:42.984 200 POST /v1beta/models/gemini-2.0-flash:generateContent?%24alt=json%3Benum-encoding%3Dint (127.0.0.1) 3730.84ms
    ```json
    [
      {
        "Description": "Horizon Almond Milk Unsweetened 32oz",
        "UPC": 245678901234,
        "Brand": "Horizon",
        "Category": "Dairy",
        "Subcategory": "Milk",
        "Geography": "Maryland",
        "Attributes": "Dairy-Free, Unsweetened",
        "Similarity Score": 75,
        "Matching Factors": [
          "Same Category",
          "Same Subcategory",
          "Same Size",
          "Similar Attributes"
        ]
      },
      {
        "Description": "Stonyfield Oat Milk Original 64oz",
        "UPC": 523456789012,
        "Brand": "Stonyfield",
        "Category": "Dairy",
        "Subcategory": "Milk",
        "Geography": "California",
        "Attributes": "Organic, Creamy",
        "Similarity Score": 70,
        "Matching Factors": [
          "Same Category",
          "Same Subcategory",
          "Organic"
        ]
      },
      {
        "Description": "Organic Valley Organic Whole Milk 64oz",
        "UPC": 12345678901,
        "Brand": "Organic Valley",
        "Category": "Dairy",
        "Subcategory": "Milk",
        "Geography": "United States",
        "Attributes": "Organic, Non-GMO",
        "Similarity Score": 65,
        "Matching Factors": [
          "Same Category",
          "Same Subcategory",
          "Organic"
        ]
      },
      {
        "Description": "Horizon Coconut Milk 32oz",
        "UPC": 801234567890,
        "Brand": "Horizon",
        "Category": "Dairy",
        "Subcategory": "Milk",
        "Geography": "Pennsylvania",
        "Attributes": "Dairy-Free, Creamy",
        "Similarity Score": 60,
        "Matching Factors": [
          "Same Category",
          "Same Subcategory",
          "Same Size"
        ]
      },
      {
        "Description": "Stonyfield Greek Yogurt Vanilla 32oz",
        "UPC": 90123456789,
        "Brand": "Stonyfield",
        "Category": "Dairy",
        "Subcategory": "Yogurt",
        "Geography": "Florida",
        "Attributes": "Organic, Probiotic",
        "Similarity Score": 40,
        "Matching Factors": [
          "Same Category",
          "Same Size",
          "Organic"
        ]
      }
    ]
    ```
