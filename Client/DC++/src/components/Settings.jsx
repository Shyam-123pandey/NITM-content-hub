import React, { useState } from "react";

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b">
    <span className="text-gray-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-400 peer-checked:bg-blue-600 transition-all duration-300"></div>
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 transform peer-checked:translate-x-full"></div>
    </label>
  </div>
);

const Settings = () => {
  const [contentArticles, setContentArticles] = useState(true);
  const [contentUpdates, setContentUpdates] = useState(false);
  const [discussionEmails, setDiscussionEmails] = useState(true);
  const [calendarSync, setCalendarSync] = useState(false);
  const [opportunities, setOpportunities] = useState(true);
  const [peerSharing, setPeerSharing] = useState(true);

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

      {/* Content Preferences */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Content Preferences</h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <Toggle
            label="Show Articles"
            checked={contentArticles}
            onChange={() => setContentArticles(!contentArticles)}
          />
          <Toggle
            label="Show Project Updates"
            checked={contentUpdates}
            onChange={() => setContentUpdates(!contentUpdates)}
          />
        </div>
      </section>

      {/* Discussion */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Discussion</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <Toggle
            label="Receive Email Notifications for Replies"
            checked={discussionEmails}
            onChange={() => setDiscussionEmails(!discussionEmails)}
          />
        </div>
      </section>

      {/* Calendar */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Calendar Integration</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <Toggle
            label="Sync with Google Calendar"
            checked={calendarSync}
            onChange={() => setCalendarSync(!calendarSync)}
          />
        </div>
      </section>

      {/* Opportunities */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Opportunities</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <Toggle
            label="Enable Internship & Job Alerts"
            checked={opportunities}
            onChange={() => setOpportunities(!opportunities)}
          />
        </div>
      </section>

      {/* Peer-to-Peer */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Peer-to-Peer Sharing</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <Toggle
            label="Enable Peer File Sharing"
            checked={peerSharing}
            onChange={() => setPeerSharing(!peerSharing)}
          />
        </div>
      </section>
    </div>
  );
};

export default Settings;
