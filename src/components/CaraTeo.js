import "../styles/cara.css";

export default function CaraTeo({ tamano = "mensaje" }) {
  return (
    <span className={`cara cara--${tamano}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="32" fill="#e5efe8" />
        <path d="M8 58c7-10 14-14 24-14s17 4 24 14v6H8v-6z" fill="#2f5d4a" />
        <path d="M24 48c2.2 6 13.8 6 16 0 1.2 5-3 9-8 9s-9.2-4-8-9z" fill="#c4785a" />
        <path d="M28 46h8v6a4 4 0 0 1-8 0v-6z" fill="#f3cbb4" />
        <path
          d="M15 31c.4-12 7.4-20 17-20s16.6 8 17 20c0 3-.6 6-2 8.5-1.6-7-4.2-12-15-12s-13.4 5-15 12c-1.4-2.5-2-5.5-2-8.5z"
          fill="#234736"
        />
        <ellipse cx="32" cy="34.5" rx="13.2" ry="14.2" fill="#f6d7c2" />
        <path d="M19 33c.6-9 6-15 13-15s12.4 6 13 15c-2.2-5.2-6.4-8-13-8s-10.8 2.8-13 8z" fill="#2f5d4a" />
        <path d="M19.2 33.5c-.8 6 .2 11 1.6 14.2.6-5 .4-9.6-.2-14.2z" fill="#234736" />
        <path d="M44.8 33.5c.8 6-.2 11-1.6 14.2-.6-5-.4-9.6.2-14.2z" fill="#234736" />
        <ellipse cx="23.4" cy="39.2" rx="2.3" ry="1.35" fill="#e7a48e" opacity="0.7" />
        <ellipse cx="40.6" cy="39.2" rx="2.3" ry="1.35" fill="#e7a48e" opacity="0.7" />
        <path d="M24.2 31.6c1.3-1.1 3.2-1.1 4.4.1" stroke="#234736" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M35.4 31.7c1.2-1.2 3.1-1.2 4.4-.1" stroke="#234736" strokeWidth="0.9" strokeLinecap="round" />
        <ellipse cx="26.8" cy="35.2" rx="1.7" ry="2" fill="#24312c" />
        <ellipse cx="37.2" cy="35.2" rx="1.7" ry="2" fill="#24312c" />
        <circle cx="27.3" cy="34.6" r="0.55" fill="#fffaf6" />
        <circle cx="37.7" cy="34.6" r="0.55" fill="#fffaf6" />
        <path d="M29.2 41.6c1 1.5 4.6 1.5 5.6 0" stroke="#8c5a44" strokeWidth="1.15" strokeLinecap="round" />
        <path d="M46 28c3.2.4 5.4 2.6 6.2 5.4-2.8-.2-5-1.8-6.2-5.4z" fill="#8fbf9e" />
        <path d="M48.2 30.2c.3 1.8.5 3.2.6 4.4" stroke="#2f5d4a" strokeWidth="0.45" strokeLinecap="round" />
      </svg>
    </span>
  );
}
