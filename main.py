from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import os


app = FastAPI()

class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None

@app.post("/items/")
def create_item(item: Item):
    return item

@app.post("/GetFunRow")
async def ParseFunRow():
    return {"uuid":"trest1231"}

if __name__ == '__main__':
    name_app = os.path.splitext(os.path.basename(__file__))[0]
    uvicorn.run(app=f"{name_app}:app", host="0.0.0.0",port=8600)