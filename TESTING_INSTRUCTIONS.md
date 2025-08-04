# Testing Instructions for Card Placement and Dragging

## Current Issues Fixed:

### 1. Card Placement Issue
**Problem**: Cards created weren't visible on the map
**Solution**: Added CardPalette and improved placement logic

### 2. Dragging Issue  
**Problem**: Dragging wasn't working properly
**Solution**: Enhanced DraggableCard component and added drag from palette

## How to Test:

### Test Card Creation and Placement:
1. **Open the app**: http://localhost:5174/
2. **Create a landmark**:
   - Click "Add Landmark" button
   - Fill out the form (name: "Test Landmark", select a domain, etc.)
   - Click Submit
3. **Check the Card Palette**:
   - Look at the right side of the screen
   - You should see a "Card Palette" with your new landmark
   - The "Landmarks" tab should show (1)
4. **Place the card**:
   - Click "Place on Map" button in the palette
   - The card should appear on the hex grid with a glowing blue border
   - You should see "Cards on map: 1" in the toolbar
   - A success message should appear

### Test Dragging:
1. **Drag from palette**:
   - Create another landmark
   - Try dragging the card preview from the palette directly onto the map
   - It should place where you drop it
2. **Drag placed cards**:
   - Click and drag a card that's already on the map
   - It should move to the new hex position
   - The card should snap to hex positions

### Test Multiple Cards:
1. **Create several cards**:
   - Create 3-4 landmarks and delves
   - Place them all on the map using "Place on Map" buttons
2. **Check positioning**:
   - Cards should appear near the center of the visible area
   - They should not overlap (each gets its own hex)
   - Use the "Debug Cards" button to see exact positions

### Debug Tools Available:
- **Card Counter**: Shows "Cards on map: X" in toolbar
- **Debug Button**: Click to see exact positions of all placed cards
- **Console Logs**: Open browser dev tools to see placement logs
- **Visual Selection**: Placed cards glow blue when selected

### Expected Behavior:
- ✅ Cards appear in palette after creation
- ✅ "Place on Map" button works and places cards visibly
- ✅ Cards can be dragged from palette to map
- ✅ Placed cards can be dragged to new positions
- ✅ Cards snap to hex grid positions
- ✅ Selected cards have glowing blue border
- ✅ Cards don't overlap (each gets unique hex)

### If Something Doesn't Work:
1. **Check browser console** for error messages
2. **Use "Debug Cards" button** to see if cards are placed but not visible
3. **Try refreshing the page** and testing again
4. **Check the Card Palette** - cards should appear there after creation

### Mobile Testing:
- Card palette moves to bottom of screen
- Touch dragging should work
- Buttons are touch-friendly sized

Let me know what specific issues you encounter!