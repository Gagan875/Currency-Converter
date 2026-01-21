# Currency Converter

A modern, responsive web application for real-time currency conversion with an intuitive user interface.

## Features

- **Real-time Exchange Rates**: Live currency conversion using reliable APIs
- **100+ Currencies**: Support for all major world currencies
- **Interactive UI**: Smooth animations and hover effects
- **Currency Swap**: One-click currency swapping with animated icon
- **Auto-update**: Exchange rates update as you type (debounced)
- **Mobile Responsive**: Optimized for all screen sizes
- **Error Handling**: Graceful fallback with demo rates when API is unavailable
- **Loading States**: Visual feedback during API calls
- **Keyboard Shortcuts**: Quick actions with Ctrl+Enter and Ctrl+S
- **Flag Icons**: Visual currency representation with country flags

## Demo

![Currency Converter Screenshot](https://via.placeholder.com/600x400/667eea/ffffff?text=Currency+Converter)

## Quick Start

1. Clone or download the project files
2. Open `index.html` in your web browser
3. Enter an amount and select currencies to convert
4. Click "Get Exchange Rate" or use keyboard shortcuts

## File Structure

```
currency-converter/
├── index.html      # Main HTML structure
├── app.js          # Core JavaScript functionality
├── code.js         # Currency-to-country mapping
├── style.css       # Styling and responsive design
└── README.md       # This file
```

## Usage

### Basic Conversion
1. Enter the amount you want to convert
2. Select the source currency from the "From" dropdown
3. Select the target currency from the "To" dropdown
4. Click "Get Exchange Rate" or press Ctrl+Enter

### Advanced Features
- **Swap Currencies**: Click the ⇄ icon or press Ctrl+S
- **Auto-update**: Start typing in the amount field for instant updates
- **Mobile**: Responsive design works on all devices

### Keyboard Shortcuts
- `Ctrl + Enter`: Convert currency
- `Ctrl + S`: Swap currencies

## Technical Details

### APIs Used
- **Primary**: ExchangeRate-API (https://api.exchangerate-api.com)
- **Fallback**: Demo rates for offline functionality
- **Flags**: FlagsAPI for country flag images

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Dependencies
- No external JavaScript libraries required
- Uses modern ES6+ features
- Fallback icons included (no Font Awesome dependency)

## Customization

### Adding New Currencies
Edit the `countryList` object in `code.js` to add new currency codes and their corresponding country codes.

### Styling
Modify `style.css` to customize:
- Color scheme (currently purple gradient)
- Layout and spacing
- Animation effects
- Responsive breakpoints

### API Configuration
Change the `BASE_URL` in `app.js` to use a different exchange rate API.

## Features in Detail

### Error Handling
- Network error recovery
- Invalid input validation
- API fallback with demo rates
- User-friendly error messages

### Performance Optimizations
- Debounced input updates (500ms delay)
- Smart API calls (avoids unnecessary requests)
- Efficient DOM manipulation
- Lazy loading of exchange rates

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- High contrast design
- Touch-friendly mobile interface

## Browser Console

The app includes comprehensive error logging. Open browser developer tools to see detailed information about API calls and any issues.

## Contributing

Feel free to submit issues and enhancement requests!

### Development Setup
1. Clone the repository
2. Open `index.html` in a web browser
3. Make changes to the source files
4. Refresh the browser to see updates

## License

This project is open source and available under the [MIT License](LICENSE).

## Changelog

### v2.0.0 (Latest)
- ✨ Added currency swap functionality
- ✨ Real-time updates while typing
- ✨ Loading states and error handling
- ✨ Keyboard shortcuts
- ✨ Mobile responsive design
- ✨ Number formatting with commas
- 🔧 Fixed API reliability issues
- 🔧 Improved error recovery
- 🎨 Modern gradient design
- 🎨 Smooth animations and transitions

### v1.0.0
- Basic currency conversion
- Static exchange rates
- Simple UI design

## Support

If you encounter any issues or have questions, please check the browser console for error messages and ensure you have a stable internet connection for live exchange rates.