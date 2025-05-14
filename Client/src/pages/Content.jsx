import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Content() {
    const [contentList, setContentList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/content');
                console.log('API Response:', response.data);
                if (Array.isArray(response.data)) {
                    setContentList(response.data);
                } else {
                    setContentList([]);
                }
            } catch (error) {
                console.error('Error fetching content:', error);
                setContentList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Content Library</h1>
            
            {/* Simple file upload */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="file"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('title', file.name);
                            formData.append('description', 'Uploaded file');
                            formData.append('type', 'resource');
                            formData.append('program', 'B.Tech');
                            formData.append('branch', 'CSE');
                            formData.append('semester', '1');

                            axios.post('http://localhost:5000/api/content', formData)
                                .then(() => {
                                    alert('File uploaded successfully');
                                    window.location.reload();
                                })
                                .catch(error => {
                                    console.error('Upload error:', error);
                                    alert('Upload failed');
                                });
                        }
                    }}
                />
            </div>

            {/* Content list */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {contentList && contentList.length > 0 ? (
                    contentList.map((item) => (
                        <div 
                            key={item._id} 
                            style={{ 
                                border: '1px solid #ddd',
                                padding: '15px',
                                borderRadius: '8px'
                            }}
                        >
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <div>
                                <span style={{ marginRight: '10px' }}>Type: {item.type}</span>
                                <span style={{ marginRight: '10px' }}>Program: {item.program}</span>
                                <span>Branch: {item.branch}</span>
                            </div>
                            {item.fileUrl && (
                                <a 
                                    href={`http://localhost:5000${item.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: 'blue', textDecoration: 'underline' }}
                                >
                                    Download File
                                </a>
                            )}
                        </div>
                    ))
                ) : (
                    <div>No content available</div>
                )}
            </div>
        </div>
    );
}

export default Content; 