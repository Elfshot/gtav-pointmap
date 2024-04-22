const colors = [
  'bgreen', 'blue', 'brown', 'green', 'grey', 'lblue', 'orange', 'pink', 'purple', 'pyellow', 'red', 'teal', 'yellow'
];
export function getRandomColor() {
  return `images/emotes/${colors[Math.floor(Math.random() * colors.length)]}.png`;
}

export function getIcon(url, size, shawdowUrl, shadowsize) {
  const icon = L.icon({
    iconUrl: url,
    iconSize: size,
    iconAnchor: [20, 3],
    popupAnchor: [0, 0],
    shadowUrl: shawdowUrl,
    shadowSize: [shadowsize, shadowsize],
    shadowAnchor: [20, 5],
  });
  return icon;
}
