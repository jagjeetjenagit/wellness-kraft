import { whatsappNumber, whatsappMessage } from "@/lib/config";

// Floating WhatsApp support button.
// Follows the site's graceful-degradation rule: if no number is configured
// (NEXT_PUBLIC_WHATSAPP_NUMBER), nothing renders and the site is unchanged.
export default function WhatsAppButton() {
  const number = whatsappNumber();
  if (!number) return null;

  const href = `https://wa.me/${number}?text=${encodeURIComponent(whatsappMessage())}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      // Sits above the gesture/safe area on phones; nudged left a touch so it
      // never overlaps the browser scrollbar on desktop.
      className="group fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 shrink-0 fill-current"
        aria-hidden="true"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24.044 12.045.044 5.463.044.101 5.406.099 11.986c0 2.096.549 4.14 1.595 5.945L0 24l6.304-1.654a11.881 11.881 0 005.684 1.448h.005c6.581 0 11.945-5.363 11.948-11.945a11.9 11.9 0 00-3.421-8.4" />
      </svg>
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}
