const fs = require('fs');
const filePath = 'd:/Connect App/frontend/src/pages/customer/Dashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace garbled characters in the newly added stay details page
content = content.replace(/ðŸ“… Check-in/g, 'Check-in');
content = content.replace(/ðŸ“… Check-out/g, 'Check-out');
content = content.replace(/ðŸŒ™ Nights/g, 'Nights');
content = content.replace(/ðŸ› ï¸  Rooms/g, 'Rooms');
content = content.replace(/ðŸ‘¤ Guests/g, 'Guests');
content = content.replace(/ðŸ‘¤ {room.guests}/g, '{room.guests}');
content = content.replace(/ðŸ› ï¸  {room.bed}/g, '{room.bed}');
content = content.replace(/ðŸ“  {room.area}/g, '{room.area}');
content = content.replace(/ðŸ‘ /g, '👍');

// Replace standard double-decoded characters to clean text/standard icons
content = content.replace(/ðŸ“... CHECK-IN/g, 'CHECK-IN');
content = content.replace(/ðŸ“... CHECK-OUT/g, 'CHECK-OUT');
content = content.replace(/ðŸŒœ NIGHTS/g, 'NIGHTS');
content = content.replace(/ðŸ›Œ ROOMS/g, 'ROOMS');
content = content.replace(/ðŸ‘GUESTS/g, 'GUESTS');
content = content.replace(/ðŸ‘  2 Guests/g, '2 Guests');
content = content.replace(/ðŸ›Œ 1 Queen Bed/g, '1 Queen Bed');
content = content.replace(/ðŸ“  180 sq.ft/g, '180 sq.ft');

// Clean up other potential garbled sequences in the codebase
content = content.replace(/â˜•/g, '☕');
content = content.replace(/ðŸ‘¨â€ ðŸ’¼/g, '👨‍💼');
content = content.replace(/â ¤ï¸ /g, '❤️');
content = content.replace(/ðŸ‘¨â€ ðŸ’©â€ ðŸ’§â€ ðŸ’¦/g, 'Family');
content = content.replace(/ðŸ‘¨â€ ðŸ’©â€ ðŸ’§/g, 'Family');
content = content.replace(/âœˆ/g, '✈️');
content = content.replace(/âš–/g, '⚖️');
content = content.replace(/âœ“/g, '✓');
content = content.replace(/â†’/g, '→');
content = content.replace(/â˜…/g, '★');
content = content.replace(/â€”/g, '—');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully cleaned up garbled characters in Dashboard.jsx.');
