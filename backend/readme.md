# NoteSage Project

## Setup Instructions

Follow these steps to set up and run the NoteSage project locally:

### 1. Create and Activate Virtual Environment

1. Open your terminal or command prompt.
2. Navigate to the directory where you want to set up the project.
3. Create a virtual environment by running:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

### 2. Install Dependencies

Once the virtual environment is activated, install the required dependencies using `pip`:
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env` file in the project directory to store your environment variables, such as API keys and database URIs. The file should include:
```env
MONGODB_URI=<your_mongodb_uri>
AWS_ACCESS_KEY=<your_aws_access_key>
AWS_SECRET_KEY=<your_aws_secret_key>
S3_BUCKET=<your_s3_bucket_name>
OPENAI_API_KEY=<your_openai_api_key>
JWT_SECRET_KEY=<your_jwt_secret_key>
```
Replace `<your_*_key>` with the actual keys you need.

### 4. Run the Application

To start the Flask development server, run:
```bash
python -m dotenv .env run flask run
```
The application should now be running locally on `http://127.0.0.1:5000/`.

### 5. Testing the Application

You can use the provided HTML file to test all the features of the NoteSage API.

- Open the `index.html` file in a browser.
- Use the interface to interact with the backend, including signing up, logging in, uploading notes, and generating summaries.

## Notes
- Make sure the virtual environment is activated whenever running the server or installing new dependencies.
- If the server fails to run, check the `.env` file to ensure all necessary environment variables are set correctly.

