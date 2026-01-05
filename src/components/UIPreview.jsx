import React, { useState, useMemo } from 'react';
import {
  X,
  Monitor,
  Moon,
  Sun,
  Check,
  ChevronRight,
  Bell,
  User,
  Settings,
  Search,
  Heart,
  ShoppingCart,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { colord } from 'colord';

// Helper to determine if text should be light or dark based on background
const getTextColor = (bgColor) => {
  try {
    return colord(bgColor).isLight() ? '#1f2937' : '#ffffff';
  } catch {
    return '#1f2937';
  }
};

// Helper to get a slightly darker/lighter variant
const getVariant = (color, amount = 0.1, darker = true) => {
  try {
    return darker
      ? colord(color).darken(amount).toHex()
      : colord(color).lighten(amount).toHex();
  } catch {
    return color;
  }
};

const UIPreview = ({ colors, onClose }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('components');

  // Build theme from palette colors
  const theme = useMemo(() => {
    const primary = colors[0] || '#6366f1';
    const secondary = colors[1] || '#8b5cf6';
    const accent = colors[2] || '#ec4899';
    const surface = colors[3] || '#f3f4f6';
    const background = colors[4] || '#ffffff';

    return {
      primary,
      primaryHover: getVariant(primary, 0.1, true),
      primaryText: getTextColor(primary),
      secondary,
      secondaryHover: getVariant(secondary, 0.1, true),
      secondaryText: getTextColor(secondary),
      accent,
      accentText: getTextColor(accent),
      surface: darkMode ? '#1f2937' : surface,
      surfaceText: darkMode ? '#f9fafb' : getTextColor(surface),
      background: darkMode ? '#111827' : background,
      backgroundText: darkMode ? '#f9fafb' : getTextColor(background),
      border: darkMode ? '#374151' : '#e5e7eb',
      muted: darkMode ? '#6b7280' : '#9ca3af',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
  }, [colors, darkMode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Live UI Preview</h2>
              <p className="text-xs text-gray-500">See how your palette looks on real UI components</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-700'}
              `}
            >
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{darkMode ? 'Dark' : 'Light'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-4">
          {[
            { id: 'components', label: 'Components' },
            { id: 'cards', label: 'Cards' },
            { id: 'forms', label: 'Forms' },
            { id: 'hero', label: 'Hero Section' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-6 transition-colors duration-300"
          style={{ backgroundColor: theme.background }}
        >
          {/* Components Tab */}
          {activeTab === 'components' && (
            <div className="space-y-8">
              {/* Buttons Section */}
              <section>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.backgroundText }}>
                  Buttons
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: theme.primary,
                      color: theme.primaryText
                    }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: theme.secondary,
                      color: theme.secondaryText
                    }}
                  >
                    Secondary
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium border-2 transition-colors"
                    style={{
                      borderColor: theme.primary,
                      color: theme.primary,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Outline
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.accentText
                    }}
                  >
                    Accent
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed"
                    style={{
                      backgroundColor: theme.muted,
                      color: '#ffffff'
                    }}
                  >
                    Disabled
                  </button>
                </div>
              </section>

              {/* Badges & Tags */}
              <section>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.backgroundText }}>
                  Badges & Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: theme.primary, color: theme.primaryText }}
                  >
                    New
                  </span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: theme.secondary, color: theme.secondaryText }}
                  >
                    Featured
                  </span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: theme.success, color: '#ffffff' }}
                  >
                    Success
                  </span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: theme.warning, color: '#ffffff' }}
                  >
                    Warning
                  </span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: theme.error, color: '#ffffff' }}
                  >
                    Error
                  </span>
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: theme.accent, color: theme.accentText }}
                  >
                    Sale
                  </span>
                </div>
              </section>

              {/* Alerts */}
              <section>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.backgroundText }}>
                  Alerts
                </h3>
                <div className="space-y-3">
                  <div
                    className="p-4 rounded-lg border-l-4 flex items-center space-x-3"
                    style={{
                      backgroundColor: colord(theme.primary).alpha(0.1).toRgbString(),
                      borderColor: theme.primary
                    }}
                  >
                    <Bell style={{ color: theme.primary }} className="w-5 h-5" />
                    <p className="text-sm" style={{ color: theme.backgroundText }}>
                      This is an informational alert message.
                    </p>
                  </div>
                  <div
                    className="p-4 rounded-lg border-l-4 flex items-center space-x-3"
                    style={{
                      backgroundColor: colord(theme.success).alpha(0.1).toRgbString(),
                      borderColor: theme.success
                    }}
                  >
                    <Check style={{ color: theme.success }} className="w-5 h-5" />
                    <p className="text-sm" style={{ color: theme.backgroundText }}>
                      Your changes have been saved successfully!
                    </p>
                  </div>
                </div>
              </section>

              {/* Navigation */}
              <section>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.backgroundText }}>
                  Navigation Bar
                </h3>
                <nav
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: theme.surface }}
                >
                  <div className="flex items-center space-x-6">
                    <span className="font-bold text-lg" style={{ color: theme.primary }}>
                      Logo
                    </span>
                    <div className="hidden md:flex items-center space-x-4">
                      {['Home', 'Products', 'About', 'Contact'].map((item, i) => (
                        <a
                          key={item}
                          href="#"
                          className="text-sm font-medium transition-colors"
                          style={{ color: i === 0 ? theme.primary : theme.surfaceText }}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: theme.surfaceText }}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: theme.surfaceText }}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: theme.primary, color: theme.primaryText }}
                    >
                      Sign In
                    </button>
                  </div>
                </nav>
              </section>

              {/* Progress Bar */}
              <section>
                <h3 className="text-sm font-bold mb-4" style={{ color: theme.backgroundText }}>
                  Progress Bars
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: theme.muted }}>
                      <span>Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: theme.border }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ backgroundColor: theme.primary, width: '75%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: theme.muted }}>
                      <span>Secondary</span>
                      <span>50%</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: theme.border }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ backgroundColor: theme.secondary, width: '50%' }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Product Card */}
              <div
                className="rounded-xl overflow-hidden shadow-lg"
                style={{ backgroundColor: theme.surface }}
              >
                <div
                  className="h-40 flex items-center justify-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <ShoppingCart className="w-12 h-12" style={{ color: theme.primaryText }} />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold" style={{ color: theme.surfaceText }}>Product Name</h4>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: theme.accent, color: theme.accentText }}
                    >
                      Sale
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: theme.muted }}>
                    A brief description of this amazing product.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold" style={{ color: theme.primary }}>$99.00</span>
                    <button
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{ backgroundColor: theme.primary, color: theme.primaryText }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Card */}
              <div
                className="rounded-xl overflow-hidden shadow-lg p-6 text-center"
                style={{ backgroundColor: theme.surface }}
              >
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: theme.secondary }}
                >
                  <User className="w-10 h-10" style={{ color: theme.secondaryText }} />
                </div>
                <h4 className="font-bold text-lg" style={{ color: theme.surfaceText }}>John Doe</h4>
                <p className="text-sm mb-4" style={{ color: theme.muted }}>Product Designer</p>
                <div className="flex justify-center space-x-4 mb-4">
                  <div className="text-center">
                    <p className="font-bold" style={{ color: theme.surfaceText }}>142</p>
                    <p className="text-xs" style={{ color: theme.muted }}>Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold" style={{ color: theme.surfaceText }}>1.2k</p>
                    <p className="text-xs" style={{ color: theme.muted }}>Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold" style={{ color: theme.surfaceText }}>284</p>
                    <p className="text-xs" style={{ color: theme.muted }}>Following</p>
                  </div>
                </div>
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: theme.primary, color: theme.primaryText }}
                >
                  Follow
                </button>
              </div>

              {/* Pricing Card */}
              <div
                className="rounded-xl overflow-hidden shadow-lg border-2"
                style={{ backgroundColor: theme.surface, borderColor: theme.primary }}
              >
                <div
                  className="p-4 text-center"
                  style={{ backgroundColor: theme.primary }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: theme.primaryText }}
                  >
                    Pro Plan
                  </span>
                </div>
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <span className="text-4xl font-black" style={{ color: theme.surfaceText }}>$29</span>
                    <span className="text-sm" style={{ color: theme.muted }}>/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm" style={{ color: theme.surfaceText }}>
                    {['Unlimited projects', 'Priority support', 'Advanced analytics', 'Custom domains'].map(feature => (
                      <li key={feature} className="flex items-center justify-center space-x-2">
                        <Check className="w-4 h-4" style={{ color: theme.success }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-bold"
                    style={{ backgroundColor: theme.primary, color: theme.primaryText }}
                  >
                    Get Started
                  </button>
                </div>
              </div>

              {/* Testimonial Card */}
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{ backgroundColor: theme.surface }}
              >
                <div className="flex items-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      style={{ color: theme.accent, fill: theme.accent }}
                    />
                  ))}
                </div>
                <p className="text-sm italic mb-4" style={{ color: theme.surfaceText }}>
                  "This product has completely transformed how our team works. Highly recommended!"
                </p>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    <User className="w-5 h-5" style={{ color: theme.secondaryText }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: theme.surfaceText }}>Jane Smith</p>
                    <p className="text-xs" style={{ color: theme.muted }}>CEO, TechCorp</p>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{ backgroundColor: theme.primary }}
              >
                <h4 className="text-sm font-medium mb-4" style={{ color: colord(theme.primaryText).alpha(0.8).toRgbString() }}>
                  Total Revenue
                </h4>
                <p className="text-3xl font-black mb-2" style={{ color: theme.primaryText }}>
                  $48,574
                </p>
                <div className="flex items-center space-x-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: colord(theme.primaryText).alpha(0.2).toRgbString(), color: theme.primaryText }}
                  >
                    +12.5%
                  </span>
                  <span className="text-xs" style={{ color: colord(theme.primaryText).alpha(0.7).toRgbString() }}>
                    vs last month
                  </span>
                </div>
              </div>

              {/* Event Card */}
              <div
                className="rounded-xl overflow-hidden shadow-lg"
                style={{ backgroundColor: theme.surface }}
              >
                <div
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: theme.accent }}
                >
                  <Calendar className="w-10 h-10" style={{ color: theme.accentText }} />
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium mb-1" style={{ color: theme.accent }}>
                    March 15, 2024
                  </p>
                  <h4 className="font-bold mb-2" style={{ color: theme.surfaceText }}>Design Workshop</h4>
                  <div className="flex items-center space-x-2 text-xs" style={{ color: theme.muted }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>2:00 PM - 5:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs mt-1" style={{ color: theme.muted }}>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Conference Room A</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forms Tab */}
          {activeTab === 'forms' && (
            <div className="max-w-xl mx-auto space-y-8">
              {/* Login Form */}
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{ backgroundColor: theme.surface }}
              >
                <h3 className="text-lg font-bold mb-6" style={{ color: theme.surfaceText }}>
                  Sign In
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.surfaceText }}>
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.backgroundText
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.surfaceText }}>
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.backgroundText
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm" style={{ color: theme.surfaceText }}>
                      <input
                        type="checkbox"
                        className="rounded"
                        style={{ accentColor: theme.primary }}
                      />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-sm font-medium" style={{ color: theme.primary }}>
                      Forgot password?
                    </a>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors"
                    style={{ backgroundColor: theme.primary, color: theme.primaryText }}
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Contact Form */}
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{ backgroundColor: theme.surface }}
              >
                <h3 className="text-lg font-bold mb-6" style={{ color: theme.surfaceText }}>
                  Contact Us
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.surfaceText }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="John"
                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                        style={{
                          backgroundColor: theme.background,
                          borderColor: theme.border,
                          color: theme.backgroundText
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.surfaceText }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Doe"
                        className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                        style={{
                          backgroundColor: theme.background,
                          borderColor: theme.border,
                          color: theme.backgroundText
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.surfaceText }}>
                      Subject
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.backgroundText
                      }}
                    >
                      <option>General Inquiry</option>
                      <option>Support</option>
                      <option>Sales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: theme.surfaceText }}>
                      Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Your message..."
                      className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none resize-none"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.backgroundText
                      }}
                    />
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-bold transition-colors"
                    style={{ backgroundColor: theme.secondary, color: theme.secondaryText }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div
                className="rounded-2xl p-8 md:p-12 text-center"
                style={{ backgroundColor: theme.primary }}
              >
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                  style={{
                    backgroundColor: colord(theme.primaryText).alpha(0.2).toRgbString(),
                    color: theme.primaryText
                  }}
                >
                  New Release
                </span>
                <h1
                  className="text-3xl md:text-4xl font-black mb-4"
                  style={{ color: theme.primaryText }}
                >
                  Build Beautiful Websites Faster
                </h1>
                <p
                  className="text-lg mb-8 max-w-2xl mx-auto"
                  style={{ color: colord(theme.primaryText).alpha(0.8).toRgbString() }}
                >
                  Create stunning, responsive websites with our intuitive design tools. No coding required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    className="px-6 py-3 rounded-lg font-bold transition-colors flex items-center space-x-2"
                    style={{
                      backgroundColor: theme.background,
                      color: theme.primary
                    }}
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    className="px-6 py-3 rounded-lg font-bold border-2 transition-colors"
                    style={{
                      borderColor: theme.primaryText,
                      color: theme.primaryText,
                      backgroundColor: 'transparent'
                    }}
                  >
                    Watch Demo
                  </button>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Monitor, title: 'Responsive Design', desc: 'Looks great on all devices' },
                  { icon: Settings, title: 'Easy Customization', desc: 'Change anything with ease' },
                  { icon: Heart, title: 'Made with Love', desc: 'Crafted with attention to detail' }
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl text-center"
                    style={{ backgroundColor: theme.surface }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: colors[i] || theme.primary }}
                    >
                      <feature.icon className="w-6 h-6" style={{ color: getTextColor(colors[i] || theme.primary) }} />
                    </div>
                    <h3 className="font-bold mb-2" style={{ color: theme.surfaceText }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm" style={{ color: theme.muted }}>
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div
                className="rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between"
                style={{ backgroundColor: theme.surface }}
              >
                <div className="mb-4 md:mb-0">
                  <h2 className="text-xl font-bold mb-1" style={{ color: theme.surfaceText }}>
                    Ready to get started?
                  </h2>
                  <p className="text-sm" style={{ color: theme.muted }}>
                    Join thousands of satisfied customers today.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="px-4 py-2.5 rounded-lg border text-sm outline-none w-64"
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.backgroundText
                    }}
                  />
                  <button
                    className="px-6 py-2.5 rounded-lg font-bold"
                    style={{ backgroundColor: theme.accent, color: theme.accentText }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            {colors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={color.toUpperCase()}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default UIPreview;
