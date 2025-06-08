from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from gemini_wrapper import get_similar_products_from_gemini

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

df = pd.read_csv("mock_data.csv")

class ProductInput(BaseModel):
    UPC: str = ""
    Brand: str = ""
    Description: str = ""
    Attributes: str = ""

@app.post("/search")
def search_similar_products(data: ProductInput):
    input_data = data.dict()
    results = get_similar_products_from_gemini(input_data, df)
    return results
