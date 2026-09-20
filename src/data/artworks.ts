// GENERATED FILE — do not edit by hand.
// Source: content/manifest.json + content/images.json
// Regenerate: python3 scripts/gen_artworks.py

// Vite resolves every processed image at build time, so each file gets a
// content hash and missing files fail the build rather than 404 in production.
const files = import.meta.glob<string>("../assets/works/**/*.webp", {
  eager: true,
  import: "default",
});

const asset = (path: string): string => {
  const resolved = files[`../assets/works/${path}`];
  if (!resolved) {
    throw new Error(`Missing artwork image: ${path}`);
  }
  return resolved;
};

export type ArtworkImage = {
  src: string;
  thumb: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const im = (
  base: string,
  caption: string,
  alt: string,
  width: number,
  height: number,
): ArtworkImage => ({
  src: asset(`${base}.webp`),
  thumb: asset(`${base}.thumb.webp`),
  alt,
  caption,
  width,
  height,
});

export const categories = [
  {
    slug: "paintings",
    label: "Paintings",
    blurb: "Canvas, ceramic, stained glass and soft pastel.",
  },
  {
    slug: "functional-art",
    label: "Functional Art",
    blurb: "Consoles and cabinets, painted and built to be lived with.",
  },
  {
    slug: "sculpture",
    label: "Sculpture",
    blurb: "Carved and modelled forms that hold a space.",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export type ArtworkStatus = "Available" | "Sold" | "On request";

export type Artwork = {
  slug: string;
  title: string;
  category: CategorySlug;
  /** Medium bucket used for navigation; null when not yet recorded. */
  discipline: string | null;
  /** Fields left null are genuinely unrecorded and render as to-be-confirmed. */
  year: string | null;
  medium: string | null;
  dimensions: string | null;
  status: ArtworkStatus | null;
  blurb: string | null;
  oneLiner: string | null;
  description: string | null;
  images: ArtworkImage[];
};

export const artworks: Artwork[] = [
  {
    slug: "a-gentle-touch",
    title: "A Gentle Touch",
    category: "paintings",
    discipline: "Canvas",
    year: null,
    medium: null,
    dimensions: null,
    status: null,
    blurb: "A painting celebrating cultural beauty and is a reminder of the simplicity and tranquility",
    oneLiner: null,
    description: null,
    images: [
      im("a-gentle-touch/00-front", "Full view", "A Gentle Touch, canvas by Simpy Bansal — full view", 1305, 1600),
    ],
  },
  {
    slug: "floral-falls",
    title: "Floral Falls",
    category: "paintings",
    discipline: "Canvas",
    year: null,
    medium: null,
    dimensions: null,
    status: "Available",
    blurb: "The rushing waters weaving a melody, harmonizing with the rustling petals dancing in the breeze",
    oneLiner: null,
    description: null,
    images: [
      im("floral-falls/00-front", "Full view", "Floral Falls, canvas by Simpy Bansal — full view", 1343, 2000),
    ],
  },
  {
    slug: "mediterranean-morning",
    title: "Mediterranean Morning",
    category: "paintings",
    discipline: "Canvas",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "The first light of day illuminating the horizon with hues of orange, blues, and lavender blending the sky  seamlessly with the tranquil waters, reflecting the vibrant palette in a harmonious dance of color.",
    oneLiner: null,
    description: null,
    images: [
      im("mediterranean-morning/00-front", "Full view", "Mediterranean Morning, canvas by Simpy Bansal — full view", 1349, 2000),
    ],
  },
  {
    slug: "nights-glow",
    title: "Night's Glow",
    category: "paintings",
    discipline: "Canvas",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "A street adorned in luminous array, lights like stars guide the way.",
    oneLiner: null,
    description: null,
    images: [
      im("nights-glow/00-plain", "Full view", "Night's Glow, canvas by Simpy Bansal — full view", 2000, 1551),
    ],
  },
  {
    slug: "rain-kissed-street",
    title: "Rain Kissed Street",
    category: "paintings",
    discipline: "Canvas",
    year: null,
    medium: null,
    dimensions: null,
    status: "Available",
    blurb: "The lamp posts standing tall, stretching and glistening tapestry of reflections upon the cobblestone street.",
    oneLiner: null,
    description: null,
    images: [
      im("rain-kissed-street/00-front", "Full view", "Rain Kissed Street, canvas by Simpy Bansal — full view", 1357, 2000),
    ],
  },
  {
    slug: "blooming-symphony",
    title: "Blooming Symphony",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: "3D Ceramic painting made on wood and framed in a wooden frame",
    dimensions: "54” width × 78” height × 2” depth",
    status: "Available",
    blurb: "Each brushstroke bringing the flowers to life with petals leaping off the canvas, and portraying nature’s vibrancy",
    oneLiner: null,
    description: "This vibrant artwork combines traditional painting techniques with 3D elements. This style features vivid, bold hues that bring flowers to life, creating a sense of depth and realism. The petals, leaves, and other floral details will appear to leap off the wood base, engaging both sight and touch. Blooming Symphony serves as a captivating art piece, celebrating nature's beauty in an imaginative, modern form.",
    images: [
      im("blooming-symphony/00-bg", "In the room", "Blooming Symphony, ceramic by Simpy Bansal — in the room", 1024, 1536),
      im("blooming-symphony/01-front", "Full view", "Blooming Symphony, ceramic by Simpy Bansal — full view", 1334, 2000),
      im("blooming-symphony/02-front-2", "Full view", "Blooming Symphony, ceramic by Simpy Bansal — full view", 1462, 2000),
      im("blooming-symphony/03-white", "On white", "Blooming Symphony, ceramic by Simpy Bansal — on white", 842, 1264),
    ],
  },
  {
    slug: "echoes-of-the-dunes",
    title: "Echoes of the Dunes",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "A peaceful journey into the warm, earthy rhythm of the desert landscape.",
    oneLiner: null,
    description: "The detailed brushstrokes bring out the rugged charm of the camels, while the warm, earthy tones evoke the tranquility and timeless beauty of the desert landscape. A perfect blend of artistry and nature, this piece invites you to journey into the heart of the dunes and experience the peaceful rhythm of nomadic life.\"",
    images: [
      im("echoes-of-the-dunes/00-front", "Full view", "Echoes of the Dunes, ceramic by Simpy Bansal — full view", 866, 649),
    ],
  },
  {
    slug: "floral-fragments",
    title: "Floral Fragments",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: null,
    dimensions: null,
    status: "Available",
    blurb: "A single flower, bold and bright, Split in four—yet whole in sight.",
    oneLiner: null,
    description: `I’ve always been drawn to flowers—their beauty, softness, and the joy they bring. They have a way of lifting your mood without saying a word. In floralfragments, I chose a 3D style, to give them texture, and depth, I used bright, bold colors to reflect the energy and happiness that flowers bring.

This painting is my way of capturing the small, beautiful moments that make life feel colorful and full. It’s a reminder to celebrate those moments—big or small.`,
    images: [
      im("floral-fragments/00-bg", "In the room", "Floral Fragments, ceramic by Simpy Bansal — in the room", 1988, 2000),
      im("floral-fragments/01-detail", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1988, 2000),
      im("floral-fragments/02-detail-2", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1997, 2000),
      im("floral-fragments/03-detail-3", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 512, 2000),
      im("floral-fragments/04-detail-4", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1991, 2000),
      im("floral-fragments/05-detail-5", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 495, 2000),
      im("floral-fragments/06-detail-6", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1993, 2000),
      im("floral-fragments/07-detail-7", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1977, 2000),
      im("floral-fragments/08-detail-8", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1990, 2000),
      im("floral-fragments/09-detail-9", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1969, 2000),
      im("floral-fragments/10-detail-10", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 2000, 1986),
      im("floral-fragments/11-detail-11", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 2000, 1972),
      im("floral-fragments/12-detail-12", "Detail", "Floral Fragments, ceramic by Simpy Bansal — detail", 1988, 2000),
    ],
  },
  {
    slug: "full-circle",
    title: "Full Circle",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: "3D Ceramic painting made on wood and framed in a wooden frame",
    dimensions: "41” width × 53” height × 3” depth",
    status: "Available",
    blurb: "Hand-painted lotuses drift across the soothing calm water. A window into serene, undisturbed nature.",
    oneLiner: "A beautiful memory brought to life, one lotus at a time",
    description: `When I was little, we had a small lotus pond at home. I used to spend so much time sitting beside it, just watching the flowers bloom. There was something about the way the lotus grew so beautifully out of the water that stayed with me.

Even after I grew up and moved away, that memory never left. I always wanted to have my own lotus pond one day, just like the one from my childhood. It took time, but recently, I was finally able to get a small pond made at home.

And now, as the lotuses have started blooming, I feel that same joy I felt as a child. Without even planning it, I find myself painting lotuses again and again. It feels like something has come full circle—and through my art, I’m staying connected to that memory`,
    images: [
      im("full-circle/00-bg", "In the room", "Full Circle, ceramic by Simpy Bansal — in the room", 1200, 2000),
      im("full-circle/01-white", "On white", "Full Circle, ceramic by Simpy Bansal — on white", 1200, 2000),
    ],
  },
  {
    slug: "the-divine",
    title: "The Divine",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: "3D Ceramic painting made on wood and framed in a wooden frame",
    dimensions: "41” width × 53” height × 3” depth",
    status: "Available",
    blurb: "Hand-sculpted leaves lift from the surface of this Tree of Life, bringing memories of joy and growth. A textured tribute to a journey fully lived.",
    oneLiner: "Where every leaf tells a different story",
    description: `This painting is very close to my heart. I’ve always felt that life is not just one color or one emotion, it’s a mix of so many moments, people, and memories. That’s what inspired me to paint the Tree of Life with each leaf in a different color.

To me, the leaves represent different chapters of my life, some full of joy, others of learning, love, change, and growth. The bright colors are the moments I hold closest, and even the dull ones, though not in the spotlight, are quietly there in the background. They’ve shaped me just as much.

This tree is my way of honoring every part of my journey, how beautifully colorful life really is, even with its ups and downs.`,
    images: [
      im("the-divine/00-bg", "In the room", "The Divine, ceramic by Simpy Bansal — in the room", 1332, 2000),
      im("the-divine/01-white", "On white", "The Divine, ceramic by Simpy Bansal — on white", 1333, 2000),
      im("the-divine/02-left", "Left view", "The Divine, ceramic by Simpy Bansal — left view", 2000, 1333),
      im("the-divine/03-right", "Right view", "The Divine, ceramic by Simpy Bansal — right view", 2000, 1333),
    ],
  },
  {
    slug: "tree-of-life",
    title: "Tree of Life",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "A colorful Tree of Life honoring every chapter of the journey.",
    oneLiner: null,
    description: null,
    images: [
      im("tree-of-life/00-front", "Full view", "Tree of Life, ceramic by Simpy Bansal — full view", 1008, 2000),
    ],
  },
  {
    slug: "whispering-lake",
    title: "Whispering Lake",
    category: "paintings",
    discipline: "Ceramic",
    year: null,
    medium: "3D Ceramic painting made on wood and framed in a wooden frame",
    dimensions: "41” width × 53” height × 3” depth",
    status: "Available",
    blurb: "Whispering lake in shades of green with twin boat sailing in between",
    oneLiner: "Whispering lake in shades of green with twin boat sailing in between",
    description: `When I first saw a lotus pond, I imagined rowing a boat right through it.

Watching the water ripple around the boat and seeing the lotus leaves and flowers gently move with the waves.

I wanted to capture that beautiful moment in this painting. The two boats became the centre of my composition, surrounded by the movement of water. With layers of deep and vibrant greens to create the pond, while the touches of pink and purple in the lotus flowers bring colour and life to the scene.

Through the textures, ripples and raised lotus details, I tried to recreate the feeling of being right there on the water, gently rowing through a beautiful lotus pond.`,
    images: [
      im("whispering-lake/00-bg", "In the room", "Whispering Lake, ceramic by Simpy Bansal — in the room", 1500, 2000),
      im("whispering-lake/01-white", "On white", "Whispering Lake, ceramic by Simpy Bansal — on white", 1500, 2000),
    ],
  },
  {
    slug: "feathers-of-color",
    title: "Feathers of Color",
    category: "paintings",
    discipline: "Glass",
    year: null,
    medium: "Stain glass painting on glass framed in a wooden frame",
    dimensions: "41” width × 53” height × 3” depth",
    status: "Available",
    blurb: "A peacock opening its feathers looking magical. Working with stained glass lets the light travel through each layer, giving the colors movement and life.",
    oneLiner: "A celebration of colour with light.",
    description: `A Peacock looks so fascinating when it opens its feathers, revealing layer after layer of colour. While painting the Wings of Color I wanted to capture that moment of beauty and movement through stained glass.

The stained glass gave me another dimension to work with. As light passes through the colours, the peacock changes with it, making the artwork feel alive.

For me, this piece is my celebration of colour, light, and the effortless beauty of nature.`,
    images: [
      im("feathers-of-color/00-bg", "In the room", "Feathers of Color, glass by Simpy Bansal — in the room", 1500, 2000),
      im("feathers-of-color/01-white", "On white", "Feathers of Color, glass by Simpy Bansal — on white", 1471, 2000),
      im("feathers-of-color/02-detail", "Detail", "Feathers of Color, glass by Simpy Bansal — detail", 2000, 1500),
    ],
  },
  {
    slug: "feathers-of-paradise",
    title: "Feathers of Paradise",
    category: "paintings",
    discipline: "Glass",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "A peacock dances in sunlit hues of stained glass.",
    oneLiner: null,
    description: null,
    images: [
      im("feathers-of-paradise/00-plain", "Full view", "Feathers of Paradise, glass by Simpy Bansal — full view", 640, 480),
    ],
  },
  {
    slug: "glass-reflections",
    title: "Glass Reflections",
    category: "paintings",
    discipline: "Glass",
    year: null,
    medium: "Enamel on glass in a wooden frame",
    dimensions: "16” L × 19” H × 1” W",
    status: null,
    blurb: "An abstract painting on glass that beautifully reflects the essence of unity and connection between two souls.",
    oneLiner: "Where two souls meet, reflect, and become one.",
    description: `This piece explores the quiet connection between two souls. The abstract curves and lines gradually come together and overlap, much like two lives becoming intertwined.

Just as glass reflects what stands before it, relationships reflect understanding, togetherness, and the beauty of finding a connection.`,
    images: [
      im("glass-reflections/00-bg", "In the room", "Glass Reflections, glass by Simpy Bansal — in the room", 1689, 2000),
      im("glass-reflections/01-front", "Full view", "Glass Reflections, glass by Simpy Bansal — full view", 448, 602),
      im("glass-reflections/02-white", "On white", "Glass Reflections, glass by Simpy Bansal — on white", 1689, 2000),
      im("glass-reflections/03-detail", "Detail", "Glass Reflections, glass by Simpy Bansal — detail", 1689, 2000),
    ],
  },
  {
    slug: "my-horizon",
    title: "My Horizon",
    category: "paintings",
    discipline: "Glass",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "The ethereal beauty of the heavens captured forever in glass.",
    oneLiner: null,
    description: null,
    images: [
      im("my-horizon/00-plain", "Full view", "My Horizon, glass by Simpy Bansal — full view", 1280, 806),
    ],
  },
  {
    slug: "timeless-traditions",
    title: "Timeless Traditions",
    category: "paintings",
    discipline: "Glass",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "This glass painting is a tribute to the vibrant culture of Rajasthan bringing a touch of grace and authenticity to any space.",
    oneLiner: null,
    description: null,
    images: [
      im("timeless-traditions/00-front", "Full view", "Timeless Traditions, glass by Simpy Bansal — full view", 410, 547),
    ],
  },
  {
    slug: "vintage-noir",
    title: "Vintage Noir - The Collection",
    category: "paintings",
    discipline: "Glass",
    year: null,
    medium: "Enamel on glass in a wooden frame",
    dimensions: "16” L × 19” H × 1” W",
    status: "Available",
    blurb: "The Vintage Noir is a collection celebrating the character, craftsmanship and timeless appeal of vintage cars and motorcycles, brought to life through a distinctive hand-painted style.",
    oneLiner: "A timeless journey, etched in grace",
    description: `I’ve always had a fascination for vintage cars—their classic curves, and the stories they seem to carry. There is something about their elegance and simplicity that has always drawn me.

I don’t own one, but every time I see one on the road or in an old photo, it makes me pause and smile. Painting the vintage collection on glass was like capturing a piece of history and keeping it close.`,
    images: [
      im("vintage-noir/00-plate-1", "No. 1", "Vintage Noir - The Collection, glass by Simpy Bansal — no. 1", 1644, 1408),
      im("vintage-noir/01-plate-2", "No. 2", "Vintage Noir - The Collection, glass by Simpy Bansal — no. 2", 1695, 1434),
      im("vintage-noir/02-plate-3", "No. 3", "Vintage Noir - The Collection, glass by Simpy Bansal — no. 3", 1665, 1359),
      im("vintage-noir/03-plate-4", "No. 4", "Vintage Noir - The Collection, glass by Simpy Bansal — no. 4", 1598, 1319),
      im("vintage-noir/04-plate-5", "No. 5", "Vintage Noir - The Collection, glass by Simpy Bansal — no. 5", 2000, 1671),
    ],
  },
  {
    slug: "floating-stories",
    title: "Floating Stories",
    category: "paintings",
    discipline: "Soft Pastel",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "For me, this painting is about two boats drifting gently across the water, each carrying its own little story.",
    oneLiner: null,
    description: "Using soft pastels, I played with shades of turquoise, green, and blue to capture the calmness of the water. I added touches of colour and detail to the boats to make them stand out against the soft, flowing background. The gentle movement of the water and the quiet presence of the boats create a feeling of both stillness and movement.",
    images: [
      im("floating-stories/00-front", "Full view", "Floating Stories, soft pastel by Simpy Bansal — full view", 1438, 2000),
    ],
  },
  {
    slug: "gentle-spirit",
    title: "Gentle Spirit",
    category: "paintings",
    discipline: "Soft Pastel",
    year: null,
    medium: null,
    dimensions: null,
    status: "Sold",
    blurb: "There is no rush, no urgency—only the serenity of movement, as if the horse exists between worlds, galloping through light and air.",
    oneLiner: null,
    description: null,
    images: [
      im("gentle-spirit/00-front", "Full view", "Gentle Spirit, soft pastel by Simpy Bansal — full view", 1429, 2000),
    ],
  },
  {
    slug: "whispering-plumage",
    title: "Whispering Plumage",
    category: "paintings",
    discipline: "Soft Pastel",
    year: null,
    medium: null,
    dimensions: null,
    status: "Available",
    blurb: "A soft pastel peacock reflecting calm and stillness.",
    oneLiner: null,
    description: `In this painting, I wanted to move away from the usual bold colors and instead capture the gentler side of the peacock.

Using soft pastels, I tried to reflect a sense of calm and stillness—like that quiet moment just before the peacock opens its feathers.`,
    images: [
      im("whispering-plumage/00-front", "Full view", "Whispering Plumage, soft pastel by Simpy Bansal — full view", 1443, 2000),
    ],
  },
  {
    slug: "between-day-and-night",
    title: "Between Day and Night",
    category: "functional-art",
    discipline: "Console",
    year: null,
    medium: "Acrylic painting on canvas with a wooden base of functional art having a top of sawn live edge",
    dimensions: "67” width × 35” height × 20” depth",
    status: "Available",
    blurb: "As you follow this console around, a vibrant afternoon flows into indigo twilight, then gives way to bright morning. A steady wooden top grounds this passage of time.",
    oneLiner: "“Where light changes, time moves, and the city tells its story.”",
    description: `Inspired by those quiet hours when a city winds down, sleeps, and wakes up again. One side captures the bright energy of the afternoon which then slowly softens into a deep, indigo twilight. But as you follow the piece around, the dark gives way to that first, crisp line of morning gold. It’s the feeling of a fresh start, right before the rest of the world wakes up.

​A warm, live-edge wood top sits above it all, like a steady horizon line.`,
    images: [
      im("between-day-and-night/00-bg", "In the room", "Between Day and Night, console by Simpy Bansal — in the room", 1500, 2000),
      im("between-day-and-night/01-front", "Full view", "Between Day and Night, console by Simpy Bansal — full view", 2000, 1334),
      im("between-day-and-night/02-back", "Back view", "Between Day and Night, console by Simpy Bansal — back view", 2000, 1332),
      im("between-day-and-night/03-back", "Back view", "Between Day and Night, console by Simpy Bansal — back view", 2000, 1333),
      im("between-day-and-night/04-back-2", "Back view", "Between Day and Night, console by Simpy Bansal — back view", 2000, 1333),
      im("between-day-and-night/05-left", "Left view", "Between Day and Night, console by Simpy Bansal — left view", 2000, 1333),
      im("between-day-and-night/06-right", "Right view", "Between Day and Night, console by Simpy Bansal — right view", 2000, 1333),
    ],
  },
  {
    slug: "between-earth-and-sky",
    title: "Between Earth & Sky",
    category: "functional-art",
    discipline: "Console",
    year: null,
    medium: null,
    dimensions: null,
    status: null,
    blurb: "A piece that brings together different worlds—the beauty of nature and the mystery of the universe.",
    oneLiner: "Where the earth meets the sky, nature meets imagination.",
    description: `I imagined a piece that brings together different worlds—the beauty of nature and the mystery of the universe.

The front and back are painted with graceful flamingos, bringing a sense of life. For the top, I imagined looking up from this peaceful setting into a vast night sky filled with the colours of the universe.

The contrast between the flamingos below and the sky above makes it a little meeting point between earth and sky, nature and imagination.`,
    images: [],
  },
  {
    slug: "the-floating-lotus",
    title: "The Floating Lotus",
    category: "functional-art",
    discipline: "Console",
    year: null,
    medium: "Acrylic painting on canvas with a wooden base in the form of functional art",
    dimensions: "37” height × 48” width × 18” depth",
    status: "Available",
    blurb: "A lotus pond floats beneath a softly curved wooden arch. It radiates a feeling of quiet stillness and natural elegance.",
    oneLiner: "a lotus pond brought to life through color and movement",
    description: `I created The Floating Lotus as a reflection of the quiet stillness and beauty of a lotus pond. The hand-painted pond background wraps around the console, creating depth and movement from every angle.

A lotus pond floats beneath a softly curved wooden arch. For me, this console is not just furniture; it is a feeling , a moment of calm, and quiet brought into a space.`,
    images: [
      im("the-floating-lotus/00-bg", "In the room", "The Floating Lotus, console by Simpy Bansal — in the room", 1493, 2000),
      im("the-floating-lotus/01-front", "Full view", "The Floating Lotus, console by Simpy Bansal — full view", 2000, 1334),
      im("the-floating-lotus/02-back", "Back view", "The Floating Lotus, console by Simpy Bansal — back view", 2000, 1334),
      im("the-floating-lotus/03-top", "Top view", "The Floating Lotus, console by Simpy Bansal — top view", 2000, 1333),
    ],
  },
  {
    slug: "the-midnight-tide",
    title: "The Midnight Tide",
    category: "functional-art",
    discipline: "Console",
    year: null,
    medium: "Acrylic painting on canvas with a wooden base of functional art having a top of sawn live edge",
    dimensions: "48” width × 20” depth × 31” height",
    status: "Available",
    blurb: "Layered night-sky tones invoke a beautiful balance of movement and stillness. A sculptural infinity base grounds the piece, capturing a timeless, captivating celestial rhythm.",
    oneLiner: "Like a cosmic tide moving through the space",
    description: "Inspired by the quiet beauty of the night sky, this piece is painted in layered tones and creates a feeling of movement and stillness at the same time. The sculptural base, shaped in the form of infinity, represents continuity, balance, and the timeless rhythm of nature and space. Resting above it is a perched live-edge wood top, bringing warmth and grounding to the celestial movement beneath. Crafted to be both functional furniture and art, this holds presence in a space, quiet yet captivating.",
    images: [
      im("the-midnight-tide/00-bg", "In the room", "The Midnight Tide, console by Simpy Bansal — in the room", 1333, 2000),
      im("the-midnight-tide/01-front", "Full view", "The Midnight Tide, console by Simpy Bansal — full view", 1334, 2000),
      im("the-midnight-tide/02-back", "Back view", "The Midnight Tide, console by Simpy Bansal — back view", 1493, 2000),
      im("the-midnight-tide/03-top", "Top view", "The Midnight Tide, console by Simpy Bansal — top view", 2000, 1333),
      im("the-midnight-tide/04-side", "Side view", "The Midnight Tide, console by Simpy Bansal — side view", 2000, 1333),
    ],
  },
  {
    slug: "the-perched-edge",
    title: "The Perched Edge",
    category: "functional-art",
    discipline: "Console",
    year: null,
    medium: "Acrylic painting on canvas with a wooden base of functional art having a top of sawn live edge",
    dimensions: null,
    status: "Sold",
    blurb: "A functional art cabinet blending natural wood with hand-painted branches, leaves, and flowers against a warm yellow ground. Its organic design brings nature, warmth, and character indoors with timeless appeal.",
    oneLiner: null,
    description: `An invitation to bring the outdoors in.

Where natural wood meets painted wing, The Perched Edge is a custom cabinet that blurs the line between furniture and art. A raw wood top crowns a hand illustrated botanical landscape, merging classic silhouettes with a lush tropical soul. It is functional and a conversation starter.

From selecting the perfect piece of timber to painting every leaf and feather by hand, this piece was a true labor of love. The idea of perching guided the entire design. The birds do not merely appear on the doors; they feel as though they are resting on the furniture itself. Even the custom hardware dissolves into the branches, completing a scene that feels alive, grounded, and quietly poetic.`,
    images: [
      im("the-perched-edge/00-bg", "In the room", "The Perched Edge, console by Simpy Bansal — in the room", 1024, 1536),
      im("the-perched-edge/01-front", "Full view", "The Perched Edge, console by Simpy Bansal — full view", 1570, 767),
      im("the-perched-edge/02-white", "On white", "The Perched Edge, console by Simpy Bansal — on white", 1024, 1536),
      im("the-perched-edge/03-left", "Left view", "The Perched Edge, console by Simpy Bansal — left view", 2000, 1333),
      im("the-perched-edge/04-right", "Right view", "The Perched Edge, console by Simpy Bansal — right view", 1333, 2000),
      im("the-perched-edge/05-top", "Top view", "The Perched Edge, console by Simpy Bansal — top view", 2000, 1333),
      im("the-perched-edge/06-detail", "Detail", "The Perched Edge, console by Simpy Bansal — detail", 1040, 1040),
    ],
  },
  {
    slug: "the-summer-bloom",
    title: "The Summer Bloom",
    category: "functional-art",
    discipline: "Console",
    year: null,
    medium: "Acrylic painting on canvas with a wooden base of functional art having a top of sawn live edge",
    dimensions: "64” width × 34” height × 16” depth",
    status: "Available",
    blurb: "An invitation to bring the outdoors in.",
    oneLiner: "An invitation to bring the outdoors in.",
    description: `Where natural wood meets painted art, The Summer Bloom is a custom cabinet that blurs the line between furniture and art. A raw wood top crowns a hand illustrated botanical landscape, merging classic silhouettes with a lush tropical soul. It is functional and a conversation starter.

From selecting the perfect piece of timber to painting every leaf and branch by hand, this piece was a true labor of love. The idea of blooming guided the entire design. Even the custom hardware dissolves into the branches, completing a scene that feels grounded, and quietly poetic.`,
    images: [
      im("the-summer-bloom/00-bg", "In the room", "The Summer Bloom, console by Simpy Bansal — in the room", 1333, 2000),
      im("the-summer-bloom/01-front", "Full view", "The Summer Bloom, console by Simpy Bansal — full view", 2000, 1333),
      im("the-summer-bloom/02-back", "Back view", "The Summer Bloom, console by Simpy Bansal — back view", 2000, 1334),
      im("the-summer-bloom/03-top", "Top view", "The Summer Bloom, console by Simpy Bansal — top view", 2000, 1333),
    ],
  },
  {
    slug: "the-golden-duo",
    title: "The Golden Duo",
    category: "functional-art",
    discipline: "Cabinet",
    year: null,
    medium: "Acrylic ceramic painting on wood",
    dimensions: "70” height × 40” width × 18” depth",
    status: "Available",
    blurb: "Two golden reindeer journey together through the quiet stillness of the night. Set against deep black, their shared path radiates a bold yet peaceful warmth.",
    oneLiner: "Two souls, One journey",
    description: "There is something magical about seeing two reindeer moving together through the stillness of the night. I wanted to capture that moment, the quiet bond between them. Against the deep black, the gold brings them to life, creating a piece that feels both bold and peaceful.",
    images: [
      im("the-golden-duo/00-bg-2", "In the room", "The Golden Duo, cabinet by Simpy Bansal — in the room", 1797, 2000),
      im("the-golden-duo/01-front", "Full view", "The Golden Duo, cabinet by Simpy Bansal — full view", 1797, 2000),
      im("the-golden-duo/02-white", "On white", "The Golden Duo, cabinet by Simpy Bansal — on white", 1333, 2000),
    ],
  },
  {
    slug: "a-blossom-ballet",
    title: "A Blossom Ballet",
    category: "sculpture",
    discipline: "Sculpture",
    year: null,
    medium: null,
    dimensions: null,
    status: "Available",
    blurb: "Cherry blossoms softly trace whispers of spring in delicate hue.",
    oneLiner: null,
    description: null,
    images: [
      im("a-blossom-ballet/00-plain", "Full view", "A Blossom Ballet, sculpture by Simpy Bansal — full view", 1573, 1200),
    ],
  },
  {
    slug: "rhythm-of-color",
    title: "Rhythm of Color",
    category: "sculpture",
    discipline: "Sculpture",
    year: null,
    medium: "Acrylic ceramic painting on wood",
    dimensions: "12” width × 12” depth × 19” height",
    status: "Available",
    blurb: "A vibrant piece of art created to bring colour, and joy into your space.",
    oneLiner: "a piece of art created to bring colour, and  joy into your space.",
    description: `I wanted to take an everyday piece of furniture and give it a life of its own.

The form of this piece became my canvas, and I began playing with flowing lines, allowing the colours to move and curve naturally around the surface.

The vibrant colors bring energy and movement, while the touches of gold add warmth. As the pattern flows from the top down the sides, the piece seems to keep moving even when it stands still.

For me, “Rhythm of Colors" is about the beauty of movement and balance coming together in an unexpected form.

It is functional, but at the same time, it is a piece of art created to bring color, character, and a little joy into a space.`,
    images: [
      im("rhythm-of-color/00-bg", "In the room", "Rhythm of Color, sculpture by Simpy Bansal — in the room", 2000, 2000),
      im("rhythm-of-color/01-bg-2", "In the room", "Rhythm of Color, sculpture by Simpy Bansal — in the room", 2000, 2000),
      im("rhythm-of-color/02-white", "On white", "Rhythm of Color, sculpture by Simpy Bansal — on white", 2000, 2000),
      im("rhythm-of-color/03-top", "Top view", "Rhythm of Color, sculpture by Simpy Bansal — top view", 2000, 2000),
      im("rhythm-of-color/04-side", "Side view", "Rhythm of Color, sculpture by Simpy Bansal — side view", 2000, 2000),
    ],
  },
  {
    slug: "the-core",
    title: "The Core",
    category: "sculpture",
    discipline: "Sculpture",
    year: null,
    medium: "Acrylic ceramic on wood",
    dimensions: "14” width × 13” depth × 24.5” height",
    status: "Available",
    blurb: "Rich veins of color flow from deep within the trunk into every leaf above. A reminder that our brightest moments are a culmination of everything we experience in life.",
    oneLiner: "Where the colorful stories flow through the veins of life",
    description: `When I first painted my Tree of Life, I thought of the leaves as the different chapters of my life with each one carrying its own color, its own memory, and its own story.

With this piece, I wanted to take that thought a little deeper. I painted the inside of the trunk in many different colors, as if the entire life of the tree lives within it. The colors travel through its veins and find their way into the leaves, making each leaf bright and different.

For me, that is how life feels too. What we see on the outside is shaped by everything we have experienced within us. The happy moments, the difficult ones, the people we have met, the lessons we have learned. All of them become part of who we are.`,
    images: [
      im("the-core/00-bg", "In the room", "The Core, sculpture by Simpy Bansal — in the room", 1500, 2000),
      im("the-core/01-white", "On white", "The Core, sculpture by Simpy Bansal — on white", 2000, 2000),
      im("the-core/02-back", "Back view", "The Core, sculpture by Simpy Bansal — back view", 2000, 2000),
      im("the-core/03-top", "Top view", "The Core, sculpture by Simpy Bansal — top view", 2000, 2000),
      im("the-core/04-side", "Side view", "The Core, sculpture by Simpy Bansal — side view", 1500, 2000),
    ],
  },
  {
    slug: "the-tree",
    title: "The Tree",
    category: "sculpture",
    discipline: "Sculpture",
    year: null,
    medium: "Acrylic ceramic on wood",
    dimensions: "15” width × 15” depth × 25” height",
    status: "Available",
    blurb: "​I hadn’t planned on making a tree, I just kept seeing one in the base. I followed that feeling, shaped the branches, and fell completely in love with it.",
    oneLiner: "When the art itself tells you what it wants to be",
    description: `When I finished the base of this sculpture, I kept seeing a tree in it. I hadn’t planned to create one. But, it simply seemed to reveal itself to me.

I followed that feeling and began adding the texture to the trunk, then shaped the branches, letting the form grow naturally. The final touch was the three-dimensional leaves, bringing the sculpture to life.

And when it was finally complete, I completely fell in love with it. What began as a simple base had transformed into a tree full of life. Sometimes, the most beautiful creations are the ones that quietly tell us what they want to become.`,
    images: [
      im("the-tree/00-bg", "In the room", "The Tree, sculpture by Simpy Bansal — in the room", 1197, 2000),
      im("the-tree/01-white", "On white", "The Tree, sculpture by Simpy Bansal — on white", 1197, 2000),
      im("the-tree/02-top", "Top view", "The Tree, sculpture by Simpy Bansal — top view", 1333, 2000),
    ],
  },
];

export const getCategory = (slug: string) =>
  categories.find((category) => category.slug === slug);

export const artworksByCategory = (slug: string) =>
  artworks.filter((artwork) => artwork.category === slug);

/** Medium filters for a category, skipping works with no medium recorded. */
export const disciplinesIn = (slug: string) => [
  ...new Set(
    artworksByCategory(slug)
      .map((artwork) => artwork.discipline)
      .filter((discipline): discipline is string => Boolean(discipline)),
  ),
];

/** The pieces either side of this one, for detail-page navigation. */
export const adjacentArtworks = (slug: string) => {
  const index = artworks.findIndex((artwork) => artwork.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  return {
    previous: artworks[index - 1],
    next: artworks[index + 1],
  };
};

export const getArtwork = (slug: string) =>
  artworks.find((artwork) => artwork.slug === slug);
