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
- This proof of concept uses the gemini-2.0-flash, but this can be updated to a more advanced gemini LLM model if needed



```python
import pandas as pd

df = pd.read_csv("/content/mock_data.csv")
```


```python
df.head()
```





  <div id="df-8926b791-9f04-4f2f-9647-2b2340215510" class="colab-df-container">
    <div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>product_key</th>
      <th>department_tag</th>
      <th>category_tag</th>
      <th>subcategory_tag</th>
      <th>market_key</th>
      <th>Geography</th>
      <th>Description</th>
      <th>Time Period</th>
      <th>Time Period End Date</th>
      <th>UPC</th>
      <th>Department</th>
      <th>Category</th>
      <th>Subcategory</th>
      <th>Brand</th>
      <th>Product Universe</th>
      <th>Product Level</th>
      <th>Attributes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>PRD547821</td>
      <td>food_and_beverage</td>
      <td>dairy</td>
      <td>milk</td>
      <td>MKT4578</td>
      <td>United States</td>
      <td>Organic Valley Organic Whole Milk 64oz</td>
      <td>2024-Q2</td>
      <td>2024-06-15</td>
      <td>12345678901</td>
      <td>Food &amp; Beverage</td>
      <td>Dairy</td>
      <td>Milk</td>
      <td>Organic Valley</td>
      <td>Organic</td>
      <td>Item</td>
      <td>Organic, Non-GMO</td>
    </tr>
    <tr>
      <th>1</th>
      <td>PRD892341</td>
      <td>food_and_beverage</td>
      <td>dairy</td>
      <td>cheese</td>
      <td>MKT3621</td>
      <td>West Coast</td>
      <td>Horizon Sharp Cheddar Block 8oz</td>
      <td>2024-Q1</td>
      <td>2024-04-20</td>
      <td>23456789012</td>
      <td>Food &amp; Beverage</td>
      <td>Dairy</td>
      <td>Cheese</td>
      <td>Horizon</td>
      <td>Natural</td>
      <td>SKU</td>
      <td>Gluten-Free, Natural</td>
    </tr>
    <tr>
      <th>2</th>
      <td>PRD234567</td>
      <td>food_and_beverage</td>
      <td>beverages</td>
      <td>coffee</td>
      <td>MKT7849</td>
      <td>East Coast</td>
      <td>Simply Organic Organic Ground Coffee 12oz</td>
      <td>2024-Q3</td>
      <td>2024-09-10</td>
      <td>34567890123</td>
      <td>Food &amp; Beverage</td>
      <td>Beverages</td>
      <td>Coffee</td>
      <td>Simply Organic</td>
      <td>Organic</td>
      <td>Brand</td>
      <td>Organic, Fair Trade</td>
    </tr>
    <tr>
      <th>3</th>
      <td>PRD678912</td>
      <td>health_and_beauty</td>
      <td>personal_care</td>
      <td>shampoo</td>
      <td>MKT2156</td>
      <td>Southwest</td>
      <td>Tom's of Maine Organic Shampoo 16oz</td>
      <td>2024-Q2</td>
      <td>2024-07-25</td>
      <td>45678901234</td>
      <td>Health &amp; Beauty</td>
      <td>Personal Care</td>
      <td>Shampoo</td>
      <td>Tom's of Maine</td>
      <td>Natural</td>
      <td>Item</td>
      <td>Natural, Sulfate-Free</td>
    </tr>
    <tr>
      <th>4</th>
      <td>PRD345123</td>
      <td>household</td>
      <td>cleaning</td>
      <td>detergent</td>
      <td>MKT9876</td>
      <td>Southeast</td>
      <td>Seventh Generation Laundry Detergent 64oz</td>
      <td>2024-Q1</td>
      <td>2024-05-12</td>
      <td>56789012345</td>
      <td>Household</td>
      <td>Cleaning</td>
      <td>Detergent</td>
      <td>Seventh Generation</td>
      <td>Natural</td>
      <td>SKU</td>
      <td>Natural, Phosphate-Free</td>
    </tr>
  </tbody>
</table>
</div>
    <div class="colab-df-buttons">

  <div class="colab-df-container">
    <button class="colab-df-convert" onclick="convertToInteractive('df-8926b791-9f04-4f2f-9647-2b2340215510')"
            title="Convert this dataframe to an interactive table."
            style="display:none;">

  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960">
    <path d="M120-120v-720h720v720H120Zm60-500h600v-160H180v160Zm220 220h160v-160H400v160Zm0 220h160v-160H400v160ZM180-400h160v-160H180v160Zm440 0h160v-160H620v160ZM180-180h160v-160H180v160Zm440 0h160v-160H620v160Z"/>
  </svg>
    </button>

  <style>
    .colab-df-container {
      display:flex;
      gap: 12px;
    }

    .colab-df-convert {
      background-color: #E8F0FE;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: none;
      fill: #1967D2;
      height: 32px;
      padding: 0 0 0 0;
      width: 32px;
    }

    .colab-df-convert:hover {
      background-color: #E2EBFA;
      box-shadow: 0px 1px 2px rgba(60, 64, 67, 0.3), 0px 1px 3px 1px rgba(60, 64, 67, 0.15);
      fill: #174EA6;
    }

    .colab-df-buttons div {
      margin-bottom: 4px;
    }

    [theme=dark] .colab-df-convert {
      background-color: #3B4455;
      fill: #D2E3FC;
    }

    [theme=dark] .colab-df-convert:hover {
      background-color: #434B5C;
      box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
      filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.3));
      fill: #FFFFFF;
    }
  </style>

    <script>
      const buttonEl =
        document.querySelector('#df-8926b791-9f04-4f2f-9647-2b2340215510 button.colab-df-convert');
      buttonEl.style.display =
        google.colab.kernel.accessAllowed ? 'block' : 'none';

      async function convertToInteractive(key) {
        const element = document.querySelector('#df-8926b791-9f04-4f2f-9647-2b2340215510');
        const dataTable =
          await google.colab.kernel.invokeFunction('convertToInteractive',
                                                    [key], {});
        if (!dataTable) return;

        const docLinkHtml = 'Like what you see? Visit the ' +
          '<a target="_blank" href=https://colab.research.google.com/notebooks/data_table.ipynb>data table notebook</a>'
          + ' to learn more about interactive tables.';
        element.innerHTML = '';
        dataTable['output_type'] = 'display_data';
        await google.colab.output.renderOutput(dataTable, element);
        const docLink = document.createElement('div');
        docLink.innerHTML = docLinkHtml;
        element.appendChild(docLink);
      }
    </script>
  </div>


    <div id="df-5d32d973-cf32-48db-a96e-79db0dbc40cc">
      <button class="colab-df-quickchart" onclick="quickchart('df-5d32d973-cf32-48db-a96e-79db0dbc40cc')"
                title="Suggest charts"
                style="display:none;">

<svg xmlns="http://www.w3.org/2000/svg" height="24px"viewBox="0 0 24 24"
     width="24px">
    <g>
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
    </g>
</svg>
      </button>

<style>
  .colab-df-quickchart {
      --bg-color: #E8F0FE;
      --fill-color: #1967D2;
      --hover-bg-color: #E2EBFA;
      --hover-fill-color: #174EA6;
      --disabled-fill-color: #AAA;
      --disabled-bg-color: #DDD;
  }

  [theme=dark] .colab-df-quickchart {
      --bg-color: #3B4455;
      --fill-color: #D2E3FC;
      --hover-bg-color: #434B5C;
      --hover-fill-color: #FFFFFF;
      --disabled-bg-color: #3B4455;
      --disabled-fill-color: #666;
  }

  .colab-df-quickchart {
    background-color: var(--bg-color);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: none;
    fill: var(--fill-color);
    height: 32px;
    padding: 0;
    width: 32px;
  }

  .colab-df-quickchart:hover {
    background-color: var(--hover-bg-color);
    box-shadow: 0 1px 2px rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15);
    fill: var(--button-hover-fill-color);
  }

  .colab-df-quickchart-complete:disabled,
  .colab-df-quickchart-complete:disabled:hover {
    background-color: var(--disabled-bg-color);
    fill: var(--disabled-fill-color);
    box-shadow: none;
  }

  .colab-df-spinner {
    border: 2px solid var(--fill-color);
    border-color: transparent;
    border-bottom-color: var(--fill-color);
    animation:
      spin 1s steps(1) infinite;
  }

  @keyframes spin {
    0% {
      border-color: transparent;
      border-bottom-color: var(--fill-color);
      border-left-color: var(--fill-color);
    }
    20% {
      border-color: transparent;
      border-left-color: var(--fill-color);
      border-top-color: var(--fill-color);
    }
    30% {
      border-color: transparent;
      border-left-color: var(--fill-color);
      border-top-color: var(--fill-color);
      border-right-color: var(--fill-color);
    }
    40% {
      border-color: transparent;
      border-right-color: var(--fill-color);
      border-top-color: var(--fill-color);
    }
    60% {
      border-color: transparent;
      border-right-color: var(--fill-color);
    }
    80% {
      border-color: transparent;
      border-right-color: var(--fill-color);
      border-bottom-color: var(--fill-color);
    }
    90% {
      border-color: transparent;
      border-bottom-color: var(--fill-color);
    }
  }
</style>

      <script>
        async function quickchart(key) {
          const quickchartButtonEl =
            document.querySelector('#' + key + ' button');
          quickchartButtonEl.disabled = true;  // To prevent multiple clicks.
          quickchartButtonEl.classList.add('colab-df-spinner');
          try {
            const charts = await google.colab.kernel.invokeFunction(
                'suggestCharts', [key], {});
          } catch (error) {
            console.error('Error during call to suggestCharts:', error);
          }
          quickchartButtonEl.classList.remove('colab-df-spinner');
          quickchartButtonEl.classList.add('colab-df-quickchart-complete');
        }
        (() => {
          let quickchartButtonEl =
            document.querySelector('#df-5d32d973-cf32-48db-a96e-79db0dbc40cc button');
          quickchartButtonEl.style.display =
            google.colab.kernel.accessAllowed ? 'block' : 'none';
        })();
      </script>
    </div>

    </div>
  </div>





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


```python
# Sample input product for testing
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

    2025-06-08 06:33:42.984 200 POST /v1beta/models/gemini-2.0-flash:generateContent?%24alt=json%3Benum-encoding%3Dint (127.0.0.1) 3730.84ms


    Error parsing Gemini response: invalid syntax (<string>, line 1)
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
