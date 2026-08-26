# CoachLink icon reference

This document is the canonical developer reference for icons used in the CoachLink mobile prototype.

## Icon sources

| Purpose | Package | Installed version | Reference |
|---|---|---:|---|
| Interface, navigation, actions and status | `lucide-react` | `^0.383.0` | [Lucide icon search](https://lucide.dev/icons/) |
| Sport pictograms | `@mdi/js` | `^7.4.47` | [Material Design Icons JS](https://github.com/Templarian/MaterialDesign-JS) |

Use named Lucide React components for general UI. Use the shared `SportIcon` component for sports; screens should not import MDI paths directly.

## Shared icon components

| Component | Use | Source |
|---|---|---|
| `SportIcon` | Standalone sport pictogram | `src/components/ui/SportUI.jsx` |
| `SportLabel` | Sport icon and text label | `src/components/ui/SportUI.jsx` |
| `SportBadge` | Compact or selectable sport pill | `src/components/ui/SportUI.jsx` |
| `SportTile` | Large selectable sport option | `src/components/ui/SportUI.jsx` |
| `SportSearchSelect` | Searchable single-sport selection | `src/components/ui/SportUI.jsx` |
| `SportSearchMultiSelect` | Searchable multi-sport selection | `src/components/ui/SportUI.jsx` |
| `LogoMark` | CoachLink brand mark; not a Lucide icon | `src/components/ui/Primitives.jsx` |
| `Avatar` | User/coach photo with initials fallback | `src/components/ui/Primitives.jsx` |

## Primary navigation

| Destination | Icon |
|---|---|
| Client Discover | `Home` |
| Client Bookings | `Calendar` |
| Client Messages | `MessageCircle` |
| Client Account | `User` |
| Coach Dashboard | `Home` |
| Coach Calendar | `Calendar` |
| Coach Bookings | `ClipboardList` |
| Coach Messages | `MessageCircle` |
| Coach Profile | `User` |

The navigation mapping is defined in `src/App.jsx` as `CLIENT_TABS` and `COACH_TABS`.

## Recommended semantic mapping

| UI meaning | Preferred icons |
|---|---|
| Back/forward/disclosure | `ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight`, `ChevronDown`, `ChevronUp` |
| Add/remove/edit | `Plus`, `Trash2`, `Edit3`, `X` |
| Success/selected | `Check`, `CheckCircle2`, `BadgeCheck` |
| Warning/error/blocked | `AlertTriangle`, `AlertCircle`, `XCircle`, `Ban` |
| Verified/security/privacy | `ShieldCheck`, `Shield`, `ShieldAlert`, `ShieldX`, `Lock`, `LockKeyhole`, `Fingerprint` |
| Search/filter/sort | `Search`, `SlidersHorizontal`, `ArrowUpDown` |
| Location/map | `MapPin`, `Map`, `Navigation`, `LocateFixed` |
| Booking/time | `Calendar`, `CalendarDays`, `CalendarClock`, `Clock` |
| People/profile | `User`, `Users`, `UserPlus`, `UserCheck`, `UserX` |
| Communication | `MessageCircle`, `MessagesSquare`, `Send`, `Mail`, `Phone`, `Bell` |
| Payment/payout | `CreditCard`, `Wallet`, `WalletCards`, `Banknote`, `ReceiptText`, `Landmark` |
| Media | `Camera`, `Image`, `Film`, `Play`, `Volume2`, `VolumeX` |
| Save/share/favourite | `Download`, `Upload`, `Share2`, `Heart`, `Star` |
| Loading/refresh | `Loader2`, `RefreshCcw`, `RotateCcw` |
| Coaching/performance | `Target`, `Award`, `TrendingUp`, `Sparkles`, `Wrench` |

## Sport icon mapping

The canonical mapping is stored in `src/data/sports.js`.

| Sport | MDI path |
|---|---|
| Australian Football (AFL) | `mdiFootballAustralian` |
| Archery | `mdiBowArrow` |
| Athletics | `mdiRunFast` |
| Badminton | `mdiBadminton` |
| Baseball | `mdiBaseball` |
| Basketball | `mdiBasketball` |
| Lawn Bowls | `mdiCircleMultiple` |
| Boxing | `mdiBoxingGlove` |
| Cricket | `mdiCricket` |
| CrossFit | `mdiDumbbell` |
| Cycling | `mdiBikeFast` |
| Dance | `mdiDanceBallroom` |
| Diving | `mdiDiving` |
| Equestrian | `mdiHorseHuman` |
| Fencing | `mdiFencing` |
| Football (Soccer) | `mdiSoccer` |
| Golf | `mdiGolf` |
| Gymnastics | `mdiGymnastics` |
| Hockey | `mdiHockeySticks` |
| Canoeing & Kayaking | `mdiKayaking` |
| Martial Arts | `mdiKarate` |
| Netball | Custom stroked netball SVG, with `mdiBasketball` as catalogue fallback |
| Pickleball | `mdiTennisBallOutline` |
| Pilates | `mdiMeditation` |
| Polo | `mdiPolo` |
| Rock Climbing | `mdiTerrain` |
| Rowing | `mdiRowing` |
| Rugby League | `mdiRugby` |
| Rugby Union | `mdiRugby` |
| Running | `mdiRunFast` |
| Sailing | `mdiSailBoat` |
| Skateboarding | `mdiSkateboarding` |
| Skiing | `mdiSki` |
| Snowboarding | `mdiSnowboard` |
| Softball | `mdiBaseball` |
| Squash | `mdiRacquetball` |
| Strength & Conditioning | `mdiWeightLifter` |
| Surfing | `mdiSurfing` |
| Swimming | `mdiSwim` |
| Table Tennis | `mdiTableTennis` |
| Tennis | `mdiTennis` |
| Touch Football | `mdiHandball` |
| Triathlon | `mdiBikeFast` |
| Volleyball | `mdiVolleyball` |
| Water Polo | `mdiWaterPolo` |
| Yoga | `mdiYoga` |
| Unknown/custom sport fallback | `mdiTrophyVariant` |

## Complete Lucide inventory currently imported

```text
Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowLeft, ArrowRight,
ArrowUpDown, ArrowUpRight, AtSign, Award, BadgeCheck, BadgeDollarSign, Ban,
Banknote, Battery, Bell, BellOff, BellRing, Calendar, CalendarCheck2,
CalendarClock, CalendarDays, CalendarX2, Camera, Check, CheckCircle2,
ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleDot, CircleHelp,
ClipboardList, Clock, Clock3, Compass, CornerUpLeft, CreditCard, DollarSign,
Download, Edit3, ExternalLink, Eye, EyeOff, FileCheck2, FileText, Film,
Fingerprint, Flag, Hand, Hash, Heart, HelpCircle, History, Home, Hourglass,
Image, Info, KeyRound, Landmark, Languages, Layers, Layers3, LifeBuoy, List,
Loader2, LocateFixed, Lock, LockKeyhole, LogOut, Mail, Map, MapPin, Maximize2,
MessageCircle, MessageSquareText, MessagesSquare, Monitor, Moon, MoreVertical,
Navigation, Package, Paperclip, PartyPopper, PauseCircle, Percent, Phone, Pin,
PinOff, Play, Plus, ReceiptText, RefreshCcw, Repeat, RotateCcw, RotateCw, Scale,
ScanFace, Search, Send, Settings, Share2, Shield, ShieldAlert, ShieldCheck,
ShieldX, Sliders, SlidersHorizontal, Smartphone, Sparkles, Star, Stethoscope,
Sun, Sunrise, Tablet, Tag, Target, Trash2, TrendingUp, Undo2, Upload,
UploadCloud, User, UserCheck, UserPlus, Users, UserX, Volume2, VolumeX, Wallet,
WalletCards, Wifi, WifiOff, Wrench, X, XCircle, Zap, ZoomIn, ZoomOut
```

## Implementation examples

General UI icon:

```jsx
import { ShieldCheck } from "lucide-react";

<ShieldCheck size={16} color={C.brand} aria-hidden="true" />
```

Icon-only action:

```jsx
<button type="button" aria-label="Share coach profile" style={{ width: 44, height: 44 }}>
  <Share2 size={18} color={C.white} aria-hidden="true" />
</button>
```

Sport icon:

```jsx
import { SportIcon } from "../../components/ui/SportUI";

<SportIcon sport="Swimming" size={18} color={C.brand} />
```

Sport badge:

```jsx
<SportBadge sport="Cricket" compact />
```

## Size and styling rules

| Context | Icon size | Container/touch target |
|---|---:|---:|
| Caption/badge | 12–14 | 22–30 |
| Inline metadata | 14–16 | N/A |
| Form field | 16 | Input height at least 44 |
| Settings row | 16–18 | Row height at least 44 |
| Bottom navigation | 19–21 | Tab touch target at least 44 |
| Card/feature icon | 20–24 | 36–48 |
| Success/empty-state hero | 36–44 | 72–88 |

- Use theme tokens such as `C.brand`, `C.jet`, `C.slate`, `C.success` and `C.danger`; do not add raw icon colors.
- Use the library's default Lucide stroke width unless a specific compact state requires a stronger checkmark.
- Decorative icons must have `aria-hidden="true"`.
- Icon-only buttons must have a meaningful `aria-label` and a minimum 44×44 touch target.
- Do not use emoji as functional icons.
- Do not mix unrelated icon styles inside one control group.
- Import icons directly by name so Vite can tree-shake unused assets.

## Adding a new sport

1. Choose the closest `@mdi/js` path.
2. Add the path import and catalogue entry in `src/data/sports.js`.
3. Use the canonical sport name everywhere in stored data.
4. Render it through `SportIcon`, `SportBadge`, `SportTile` or the search wrappers.
5. Add an alias only when the public label differs from the stored canonical name.
6. Confirm the icon at 13, 16 and 20 pixels in both light and dark mode.
