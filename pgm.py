import requests
from bs4 import BeautifulSoup
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import csv
import os

# Define the list of categories
categories = ["general", "business", "health", "science", "sports", "technology"]

# List of sources to skip
excluded_domains = ["washingtonpost.com", "nytimes.com", "cbsnews.com"]  # Add domains you want to exclude

def fetch_article_content(url):
    """
    Fetches and cleans article content from a given URL.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract paragraphs from the HTML
        paragraphs = soup.find_all('p')
        content = ' '.join([para.get_text() for para in paragraphs])
        return content.strip()
    except Exception as e:
        print(f"Error fetching content from {url}: {e}")
        return ""

def summarize_text_sumy(text, num_sentences=5):
    """
    Summarizes the text using Sumy's LSA summarizer.
    """
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, num_sentences)
        return " ".join([str(sentence) for sentence in summary])
    except Exception as e:
        return f"Error summarizing text: {e}"

def save_summary_to_csv(data, category, filename="summaries.csv"):
    """
    Saves the data to a CSV file for a specific category.
    """
    try:
        file_path = f"{category}.csv"
        
        # Check if file exists and write header if it doesn't
        write_header = not os.path.exists(file_path)
        
        # Open the category-specific CSV file in write mode
        with open(file_path, mode="a" if not write_header else "w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            if write_header:
                writer.writerow(["title", "image_url", "summary"])
            # Write the article data
            writer.writerow([data["title"], data["image_url"], data["summary"]])
        print(f"Data saved to {category}.csv")
    except Exception as e:
        print(f"Error saving data to {category}.csv: {e}")

def delete_previous_csv_files():
    """
    Deletes existing CSV files for all categories.
    """
    for category in categories:
        file_path = f"{category}.csv"
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted old CSV file: {file_path}")

def is_excluded_source(url):
    """
    Checks if the URL belongs to an excluded domain.
    """
    for domain in excluded_domains:
        if domain in url:
            return True
    return False

def fetch_and_process_news(api_key):
    """
    Fetches and processes news for each category and saves them to their respective CSV files.
    """
    # Delete previous CSV files
    delete_previous_csv_files()
    
    for category in categories:
        url = f"https://newsapi.org/v2/top-headlines?category={category}&apiKey={api_key}"
        response = requests.get(url).json()

        for article in response.get("articles", []):
            title = article.get("title", "No title")
            article_url = article.get("url", "")
            
            # Skip articles with [removed] in the title or from excluded domains
            if "[removed]" in title.lower() or is_excluded_source(article_url):
                print(f"Skipping article from excluded source: {article_url}\n")
                continue

            description = article.get("description", "No description")
            image_url = article.get("urlToImage", "")

            print(f"Fetching content for article: {title} (Category: {category})")
            article_content = fetch_article_content(article_url)

            if article_content:
                summary = summarize_text_sumy(article_content, num_sentences=5)
                print(f"Summary:\n{summary}\n")

                # Prepare the data for CSV
                data = {
                    "title": title,
                    "description": description,
                    "image_url": image_url,
                    "summary": summary
                }

                # Save the data to the appropriate category CSV file
                save_summary_to_csv(data, category)
            else:
                print(f"No content available for this article in category {category}.\n")

if __name__ == "__main__":
    api_key = "7ba2c346f77b40f191dddb526207e9fe"  # Replace with your actual API key
    fetch_and_process_news(api_key)
