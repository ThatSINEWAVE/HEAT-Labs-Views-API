<div align="center">

# PCWStats Privacy-Focused View Tracker API

A completely anonymous, privacy-respecting view counter API designed for [PCWStats](https://pcwstats.com) website. This system tracks page views without collecting any user-identifiable information.

</div>

## Key Features

- **Zero User Tracking**: No cookies, no fingerprints, no personal data collection
- **Simple & Transparent**: Single transparent pixel tracking with no hidden behaviors
- **Open Source**: Fully auditable codebase
- **Lightweight**: Minimal performance impact
- **CORS-enabled**: Ready for cross-origin usage

<div align="center">

## ☕ [Support my work on Ko-Fi](https://ko-fi.com/thatsinewave)

</div>

## How It Works

The system uses a simple 1x1 transparent pixel to record views while maintaining complete anonymity:

1. When a page loads, it requests the tracking pixel from `/[image].js`
2. The API records a view for that specific image/page
3. A transparent pixel is returned with no tracking capabilities

## API Endpoints

### Record a View
```
GET /api/[image]
```
Records a view for the specified image/page. Returns a transparent 1x1 pixel.

### Get Statistics
```
GET /api/stats
```
Returns view statistics for all tracked images.

**Optional Parameters:**
- `image` - Get stats for a specific image only
- `nocache=true` - Bypass cache for fresh data

### Get Daily Statistics
```
GET /api/stats-by-day
```
Returns view statistics organized by date.

**Optional Parameters:**
- `image` - Filter by specific image
- `date` - Get views for a specific date
- `nocache=true` - Bypass cache for fresh data

<div align="center">

## [Join my discord server](https://thatsinewave.github.io/Discord-Redirect/)

</div>

## Data Structure

Views are stored with two levels:
1. **Total views**: Aggregate count for each image
2. **Daily views**: Breakdown by date (YYYY-MM-DD format)

Example response:
```json
{
  "example-image": {
    "totalViews": 1250,
    "dailyViews": {
      "2023-01-01": 50,
      "2023-01-02": 75
    }
  }
}
```

## Privacy Guarantee

This system is designed with privacy as the top priority:
- No IP addresses are stored
- No cookies are set
- No user agents or device information is collected
- No referrer data is recorded
- No cross-site tracking capabilities

## License

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.  
