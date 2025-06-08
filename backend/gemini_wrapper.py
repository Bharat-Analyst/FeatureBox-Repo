import google.generativeai as genai
import pandas as pd


genai.configure(api_key="GEMINI_API_KEY")

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
