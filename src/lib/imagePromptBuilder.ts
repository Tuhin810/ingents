/**
 * Image prompt builder for Gemini/Imagen-style image generation.
 *
 * Purpose:
 * - Provide unambiguous, descriptive prompts that lead to simple, clear images.
 * - Keep prompts deterministic and focused on composition, colors, lighting, and subject.
 *
 * Usage:
 * import { buildGeminiImagePrompt, templates, examples } from '@/lib/imagePromptBuilder'
 * const prompt = buildGeminiImagePrompt({ subject: 'a modern office space', style: 'photorealistic', colorPalette: 'muted blues and grays', aspect: '4:3' })
 */

export type ImagePromptOptions = {
  subject: string; // main subject of the image, short phrase
  action?: string; // what the subject is doing (optional)
  style?: string; // photorealistic, flat-illustration, vector, isometric, minimal, editorial
  colorPalette?: string; // e.g., "muted blues and grays"
  mood?: string; // calm, energetic, celebratory
  composition?: string; // "close-up", "wide-angle", "top-down"
  lighting?: string; // "soft natural light", "studio lighting", "golden hour"
  aspect?: string; // "16:9", "4:3", "1:1"
  background?: string; // background specifics or environment
  avoid?: string; // things to avoid e.g., "no text, no logos"
};

/** Common templates that users can pick from and then fill with details. */
export const templates = {
  photorealistic:
    "{subject}{action} in a photorealistic style, {composition}, {lighting}, colors: {colorPalette}. Background: {background}. {avoid}",
  flatIllustration:
    "Flat vector illustration of {subject}{action}, minimal composition, color palette: {colorPalette}, clean lines, {composition}, {avoid}",
  editorial:
    "Editorial photo-style image of {subject}{action}, {composition}, cinematic lighting: {lighting}, muted tones: {colorPalette}, Background: {background}, {avoid}",
};

function safe(value?: string) {
  return value ? value.trim() : "";
}

/**
 * Build a prompt string from options and an optional template name.
 * Returns a concise, explicit prompt suitable for Gemini/Imagen image generation.
 */
export function buildGeminiImagePrompt(
  opts: ImagePromptOptions,
  templateName: keyof typeof templates = "photorealistic"
): string {
  const t = templates[templateName] || templates.photorealistic;

  const filled = t
    .replace('{subject}', safe(opts.subject))
    .replace('{action}', opts.action ? ` ${safe(opts.action)}` : '')
    .replace('{composition}', safe(opts.composition) || 'medium shot')
    .replace('{lighting}', safe(opts.lighting) || 'soft natural light')
    .replace('{colorPalette}', safe(opts.colorPalette) || 'neutral tones')
    .replace('{background}', safe(opts.background) || 'simple uncluttered background')
    .replace('{avoid}', safe(opts.avoid) || 'no text, no logos');

  // Include aspect ratio at the end if provided
  const aspect = opts.aspect ? ` --ar ${opts.aspect}` : '';

  // Trim multiples spaces and return final prompt
  return (filled + aspect).replace(/\s+/g, ' ').trim();
}

/**
 * Build a prompt from a user's free-text request and optional company context.
 * This parses the user text minimally and produces a clear subject + context prompt.
 */
export function buildFromUserText(userText: string, companyContext?: string) {
  const cleaned = (userText || '')
    .replace(/with image/gi, '')
    .replace(/create|generate|make|write|post/gi, '')
    .trim();

  // Extract a short subject (first clause before comma or 'for') and expand if short
  let subject = cleaned.split(/[,.]/)[0];
  subject = subject.split(/ for | about | of /i)[0].trim();
  if (!subject) subject = 'a well-composed product shot';

  // Detect keywords to enrich the scene
  const lower = userText.toLowerCase();
  const isTech = /tech|technology|developer|startup|saas|software|engineer|coding|code/i.test(lower);
  const isIndia = /\bindia\b/i.test(lower);

  // Detect festival / cultural events to produce appropriate imagery
  const festivalMatch = ((): string | null => {
    const festivals: { pattern: RegExp; name: string }[] = [
      { pattern: /diwali|deepavali/i, name: 'Diwali' },
      { pattern: /durga puja|durgapuja|durga/i, name: 'Durga Puja' },
      { pattern: /navratri/i, name: 'Navratri' },
      { pattern: /dussehra|vijayadashami/i, name: 'Dussehra' },
      { pattern: /holi/i, name: 'Holi' },
      { pattern: /eid|eid al-fitr|eid al-adha/i, name: 'Eid' },
      { pattern: /christmas/i, name: 'Christmas' },
    ];
    for (const f of festivals) if (f.pattern.test(userText)) return f.name;
    return null;
  })();


  // Build richer background and props based on keywords
  let background = 'modern office interior, tidy and uncluttered';
  let props = '';

  // Build festival info dynamically (small knowledge map used to craft descriptive phrases)
  function getFestivalInfo(name: string) {
    const k = name.toLowerCase();
    const info: { scene: string; elements: string[]; colors: string; mood: string } = {
      scene: 'festive setting with cultural decorations',
      elements: ['decorations', 'candles'],
      colors: 'warm tones',
      mood: 'celebratory',
    };
    if (k.includes('diwali')) {
      info.scene = 'home or street decorated with diyas and rangoli, warm golden lighting';
      info.elements = ['clay diyas (oil lamps)', 'rangoli', 'marigold garlands', 'sparklers'];
      info.colors = 'golden yellows and deep reds';
      info.mood = 'joyful, warm, celebratory';
    } else if (k.includes('durga')) {
      info.scene = 'pandal with Durga idol and devotees, ceremonial decorations';
      info.elements = ['Durga idol', 'puja offerings', 'marigold garlands', 'incense and lamps'];
      info.colors = 'rich reds and golds';
      info.mood = 'devotional, grand, festive';
    } else if (k.includes('holi')) {
      info.scene = 'outdoor courtyard with vibrant colored powder in the air';
      info.elements = ['people throwing colored powder', 'water balloons', 'bright splashes'];
      info.colors = 'vibrant multi-colors';
      info.mood = 'playful, exuberant';
    } else if (k.includes('navratri') || k.includes('dussehra')) {
      info.scene = 'open-air celebration with dancers and traditional attire';
      info.elements = ['folk dancers', 'decorative lights', 'traditional garments'];
      info.colors = 'vibrant festive colors';
      info.mood = 'energetic, ceremonial';
    } else if (k.includes('eid')) {
      info.scene = 'community gathering with festive meals and greetings';
      info.elements = ['traditional sweets', 'families greeting', 'decorate lights'];
      info.colors = 'soft warm tones';
      info.mood = 'warm, community-focused';
    } else if (k.includes('christmas')) {
      info.scene = 'cozy home with Christmas tree, warm twinkle lights and wrapped gifts';
      info.elements = ['Christmas tree', 'ornaments', 'wrapped presents'];
      info.colors = 'greens, reds, warm whites';
      info.mood = 'cozy, festive';
    }
    return info;
  }

  if (festivalMatch) {
    const info = getFestivalInfo(festivalMatch);
    // Use dynamic composition: let the AI interpret these phrases naturally
    background = info.scene;
    props = info.elements.join(', ');
    // set a more festival-appropriate palette and mood
    // These are later used to assemble the final prompt text
    // Also make sure to avoid office/tech props when festival is present
  } else {
    // Non-festival: keep tech detection logic
    if (isIndia) {
      background = 'modern Indian tech workspace with warm natural materials, subtle local architectural details';
    }
    if (isTech) {
      props = 'a laptop with a visible code editor, a notebook, and a coffee cup';
    }
  }

  const companyName = (() => {
    if (!companyContext) return undefined;
    try {
      const parsed = JSON.parse(companyContext);
      return parsed?.name;
    } catch (e) {
      return undefined;
    }
  })();

  if (companyName) {
    background += `, subtle brand color accents related to ${companyName}`;
  }

  // Compose detailed options
  const opts: ImagePromptOptions = {
    subject: subject + (props ? `, ${props}` : ''),
    style: 'photorealistic',
    colorPalette: 'neutral tones with warm accents',
    composition: 'environmental portrait, medium-wide shot showing subject and workspace',
    lighting: 'soft natural window light with gentle rim highlights',
    aspect: '4:3',
    background,
    avoid: 'no text, no logos, no watermarks, no UI overlays, not a screenshot',
  };

  // Base photorealistic prompt
  const base = buildGeminiImagePrompt(opts, 'photorealistic');

  // Add camera / technical details and high-fidelity adjectives to increase realism
  const realismExtras =
    'Shot on a 35mm lens, shallow depth of field (f/1.8), cinematic framing, ultra-detailed, hyper-realistic, photorealistic skin tones, natural texture detail, filmic color grading, high dynamic range, studio-quality post-processing.';

  // Strong negative constraints to avoid common model issues
  const negativeExtras = 'Avoid text, logos, watermarks, UI elements, low resolution, over-saturation.';

  // Combine and return
  return `${base}. ${realismExtras} ${negativeExtras}`.replace(/\s+/g, ' ').trim();
}

/** Helpful example prompts */
export const examples = {
  productPhoto: buildGeminiImagePrompt({
    subject: 'a sleek stainless steel coffee thermos',
    composition: 'close-up, product-centered',
    lighting: 'soft studio lighting with gentle highlights',
    colorPalette: 'muted grays and warm highlights',
    aspect: '4:3',
    background: 'plain light gray background',
    avoid: 'no text, no logos',
  }),
  teamPhotoIllustration: buildGeminiImagePrompt({
    subject: 'three diverse team members collaborating at a round table',
    action: 'sharing ideas over a laptop',
    composition: 'wide-angle, showing table and laptop',
    lighting: 'warm natural window light',
    colorPalette: 'muted blues and warm accents',
    aspect: '16:9',
    background: 'modern office interior, tidy',
    avoid: 'no text, no logos',
  }, 'editorial'),
  celebrationPost: buildGeminiImagePrompt({
    subject: 'a small group celebrating a product launch with confetti',
    composition: 'medium shot',
    lighting: 'golden hour warm light',
    colorPalette: 'vibrant but balanced',
    aspect: '4:3',
    background: 'office rooftop terrace',
    avoid: 'no text, no logos',
  }),
  simpleIllustration: buildGeminiImagePrompt({
    subject: 'an isometric illustration of a SaaS dashboard',
    composition: 'isometric view, centered',
    style: 'flat-illustration',
    colorPalette: 'brand blue and white accents',
    aspect: '16:9',
    background: 'clean white background',
    avoid: 'no text, no logos',
  }, 'flatIllustration'),
};

export default buildGeminiImagePrompt;
