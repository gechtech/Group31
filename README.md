Social Engineering Attack Detector and Analysis Tool

A comprehensive web-based tool for detecting various types of cyber attacks including phishing, malware, vishing, pretexting, and tailgating. The application integrates with VirusTotal API for enhanced threat detection.

## Features

###  Attack Detection Types
- **Phishing (Email)**: Analyze email content and embedded links
- **Malicious URL**: Scan URLs for suspicious patterns and malware
- **Baiting (File)**: Upload and scan files for malware
- **Pretexting**: Analyze social engineering scenarios
- **Tailgating**: Analyze physical security incidents
- **Vishing**: Analyze voice phishing calls
- **Quid pro quo**: File-based attack analysis

### 🛡️ VirusTotal Integration
- Real-time URL scanning with 70+ antivirus engines
- File malware analysis with comprehensive threat detection
- Detailed threat reports and permalinks
- Automatic hash checking for previously analyzed files

### 📊 Enhanced Analysis
- Multiple detection heuristics
- Suspicious pattern recognition
- Detailed threat explanations
- Actionable recommendations
- Scan history tracking

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### 1. Start the Backend
```bash
# Install Python dependencies and start the Flask server
python start_backend.py
```
The backend will be available at: http://localhost:5000

### 2. Start the Frontend
```bash
# Install npm dependencies and start the React app
python start_frontend.py
```
The frontend will be available at: http://localhost:3000

### 3. Use the Application
1. Open your browser and navigate to http://localhost:3000
2. Select an attack type from the sidebar
3. Enter the data you want to analyze
4. Click the scan/analyze button
5. Review the results and recommendations

## API Endpoints

### Core Scanning
- `POST /check-url` - Scan URLs for malicious content
- `POST /check-email` - Analyze email content for phishing
- `POST /upload-file` - Upload and scan files for malware

### Social Engineering Analysis
- `POST /analyze-vishing` - Analyze voice phishing calls
- `POST /analyze-pretexting` - Analyze pretexting scenarios
- `POST /analyze-tailgating` - Analyze tailgating incidents

### Health Check
- `GET /health` - Check API status

## VirusTotal Integration

The application uses your VirusTotal API key for enhanced threat detection:

- **URL Scanning**: Submits URLs to VirusTotal for analysis by 70+ antivirus engines
- **File Scanning**: Uploads files for comprehensive malware analysis
- **Hash Checking**: Checks if files have been previously analyzed
- **Real-time Results**: Polls for analysis completion and provides detailed reports

### API Key Configuration
Your VirusTotal API key is already configured in the backend files:
- `backend/phishing_detector.py`
- `backend/malware_scanner.py`

## Usage Examples

### URL Scanning
1. Select "Malicious URL" from the sidebar
2. Enter a URL to scan (e.g., `https://example.com/login`)
3. Click "Scan"
4. Review the results including VirusTotal analysis

### Email Analysis
1. Select "Phishing (Email)" from the sidebar
2. Paste the full email content
3. Click "Analyze"
4. Review detected links and suspicious patterns

### File Scanning
1. Select "Baiting (File)" from the sidebar
2. Upload a file to scan
3. Click "Upload & Scan"
4. Review malware analysis results

### Social Engineering Analysis
1. Select the appropriate attack type (Vishing, Pretexting, Tailgating)
2. Enter the scenario details
3. Click "Analyze"
4. Review indicators and recommendations

## Security Features

### URL Analysis
- Domain blacklist checking
- IP address detection
- URL length analysis
- Suspicious character detection
- VirusTotal integration

### File Analysis
- File type detection
- Size analysis
- YARA rule matching
- PE header detection
- VirusTotal malware scanning

### Email Analysis
- Suspicious phrase detection
- Link extraction and analysis
- Sender pattern analysis
- Comprehensive threat assessment

## Development

### Running in Development Mode

#### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure Python 3.8+ is installed
   - Check that all requirements are installed: `pip install -r backend/requirements.txt`
   - Verify the VirusTotal API key is valid

2. **Frontend won't start**
   - Ensure Node.js 14+ is installed
   - Run `npm install` in the frontend directory
   - Check for port conflicts (default: 3000)

3. **VirusTotal errors**
   - Verify your API key is correct
   - Check your API quota limits
   - Ensure network connectivity

4. **File upload issues**
   - Check file size (max 200MB)
   - Verify file permissions
   - Ensure uploads directory exists

### API Error Codes
- `400`: Bad request (missing parameters)
- `500`: Internal server error
- `VT_ERROR`: VirusTotal API error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub

---

**Note**: This tool is for educational and security testing purposes. Always ensure you have proper authorization before scanning systems or files that you don't own.
