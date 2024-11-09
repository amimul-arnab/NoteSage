import React, { useState } from 'react';
import {
  AiOutlineBold,
  AiOutlineItalic,
  AiOutlineUnderline,
  AiOutlineStrikethrough,
  AiOutlineCode,
  AiOutlineLink,
} from 'react-icons/ai';
import { MdFormatColorText, MdFormatColorFill } from 'react-icons/md';
import { TbMathIntegralX } from 'react-icons/tb';

export default function RichTextToolbar({ editor, setToolbarActive }) {
  const [showTextColorDropdown, setShowTextColorDropdown] = useState(false);
  const [showBackgroundColorDropdown, setShowBackgroundColorDropdown] = useState(false);

  if (!editor) {
    return null;
  }

  // Color options for text and background
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FF9900', '#800080'];

  const applyTextColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowTextColorDropdown(false);
    setToolbarActive(false); // Hide toolbar after selecting a color
  };

  const applyBackgroundColor = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
    setShowBackgroundColorDropdown(false);
    setToolbarActive(false); // Hide toolbar after selecting a color
  };

  return (
    <div
      className="toolbar-container flex space-x-2 p-2 text-xl animated-toolbar"
      style={{
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: '8px',
        transform: 'translate(-165%, -120%)',
        top: '0',
        left: '50%',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        opacity: editor.isFocused ? 1 : 0,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={() => setToolbarActive(true)}
      onMouseLeave={() => !showTextColorDropdown && !showBackgroundColorDropdown && setToolbarActive(false)}
    >
      <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleBold().run()}>
        <AiOutlineBold />
      </button>
      <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleItalic().run()}>
        <AiOutlineItalic />
      </button>
      <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <AiOutlineUnderline />
      </button>
      <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleStrike().run()}>
        <AiOutlineStrikethrough />
      </button>
      <button className="toolbar-btn" onClick={() => editor.chain().focus().toggleCode().run()}>
        <AiOutlineCode />
      </button>
      <button className="toolbar-btn" onClick={() => {
        const url = prompt("Enter URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }}>
        <AiOutlineLink />
      </button>
      
      {/* Text Color Dropdown */}
      <div className="relative">
        <button
          className="toolbar-btn"
          onClick={() => {
            setShowTextColorDropdown(!showTextColorDropdown);
            setToolbarActive(true);
          }}
        >
          <MdFormatColorText />
        </button>
        {showTextColorDropdown && (
          <div className="absolute bg-white border p-2 rounded shadow-lg mt-2 z-10">
            {colors.map(color => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className="w-6 h-6 rounded-full m-1"
                onClick={() => applyTextColor(color)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Background Color Dropdown */}
      <div className="relative">
        <button
          className="toolbar-btn"
          onClick={() => {
            setShowBackgroundColorDropdown(!showBackgroundColorDropdown);
            setToolbarActive(true);
          }}
        >
          <MdFormatColorFill />
        </button>
        {showBackgroundColorDropdown && (
          <div className="absolute bg-white border p-2 rounded shadow-lg mt-2 z-10">
            {colors.map(color => (
              <button
                key={color}
                style={{ backgroundColor: color }}
                className="w-6 h-6 rounded-full m-1"
                onClick={() => applyBackgroundColor(color)}
              />
            ))}
          </div>
        )}
      </div>

      <button className="toolbar-btn" onClick={() => {
        const latex = prompt("Enter LaTeX:");
        if (latex) editor.chain().focus().insertMath(latex).run();
      }}>
        <TbMathIntegralX />
      </button>
    </div>
  );
}
