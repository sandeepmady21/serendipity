import React, { useState } from 'react';
import SortableTree, { 
  toggleExpandedForAll,
  addNodeUnderParent,
  removeNodeAtPath,
  changeNodeAtPath
} from '@nosferatu500/react-sortable-tree';
import '@nosferatu500/react-sortable-tree/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faMinus, 
  faEdit, 
  faTrash, 
  faFolder, 
  faFolderOpen,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

const ContentTree = ({ onSelectContent }) => {
  // Initial tree data structure
  const [treeData, setTreeData] = useState([
    {
      title: 'Astronomy',
      expanded: true,
      children: [
        { 
          title: 'Hubble Space Telescope',
          type: 'topic',
          topic: 'Astronomy',
          content: 'The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990 and remains in operation.'
        },
        { 
          title: 'James Webb Space Telescope',
          type: 'topic',
          topic: 'Astronomy',
          content: 'The James Webb Space Telescope is a space telescope designed to conduct infrared astronomy.'
        },
        {
          title: 'Telescopes',
          expanded: true,
          children: [
            { 
              title: 'Reflector Telescopes',
              type: 'flashcard',
              topic: 'Telescope',
              content: 'How do reflector telescopes work? They use mirrors to gather and focus light.'
            },
            { 
              title: 'Refractor Telescopes',
              type: 'flashcard',
              topic: 'Telescope',
              content: 'How do refractor telescopes work? They use lenses to gather and focus light.'
            }
          ]
        }
      ]
    },
    {
      title: 'Physics',
      expanded: false,
      children: [
        { 
          title: 'Quantum Mechanics',
          type: 'topic',
          topic: 'Physics',
          content: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.'
        },
        { 
          title: 'Relativity',
          type: 'topic',
          topic: 'Physics',
          content: 'The theory of relativity usually encompasses two interrelated theories by Albert Einstein: special relativity and general relativity.'
        }
      ]
    }
  ]);

  // Generate unique node ID
  const getNodeKey = ({ node, treeIndex }) => {
    return treeIndex;
  };
  
  // Toggle expand/collapse all nodes
  const toggleNodeExpansion = (expanded) => {
    setTreeData(
      toggleExpandedForAll({
        treeData,
        expanded,
      })
    );
  };

  // Add a new node
  const addNode = (parentKey) => {
    const newNodeTitle = `New Node ${treeData.length + 1}`;
    
    setTreeData(
      addNodeUnderParent({
        treeData,
        parentKey,
        expandParent: true,
        getNodeKey,
        newNode: {
          title: newNodeTitle,
          type: 'topic',
          topic: 'New Topic',
          content: ''
        },
      }).treeData
    );
  };

  // Remove a node
  const removeNode = (path) => {
    setTreeData(
      removeNodeAtPath({
        treeData,
        path,
        getNodeKey,
      })
    );
  };

  // Update node title
  const updateNodeTitle = (path, title) => {
    setTreeData(
      changeNodeAtPath({
        treeData,
        path,
        getNodeKey,
        newNode: { ...treeData[path[0]], title },
      })
    );
  };

  // Handle node click - select node to display in content container
  const handleNodeClick = (nodeInfo) => {
    if (nodeInfo.node.type && onSelectContent) {
      onSelectContent({
        type: nodeInfo.node.type,
        topic: nodeInfo.node.topic,
        title: nodeInfo.node.title,
        content: nodeInfo.node.content,
        reference: nodeInfo.node.reference || {
          source: '',
          timestamp: new Date().toISOString().split('T')[0],
          author: 'User'
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Knowledge Tree</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => toggleNodeExpansion(true)}
            className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1 px-2 rounded"
            title="Expand All"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" />
            Expand
          </button>
          <button
            onClick={() => toggleNodeExpansion(false)}
            className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 py-1 px-2 rounded"
            title="Collapse All"
          >
            <FontAwesomeIcon icon={faMinus} className="mr-1" />
            Collapse
          </button>
          <button
            onClick={() => addNode(null)}
            className="text-sm bg-green-50 hover:bg-green-100 text-green-600 py-1 px-2 rounded"
            title="Add Root Node"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" />
            Add
          </button>
        </div>
      </div>
      
      <div style={{ height: 500 }}>
        <SortableTree
          treeData={treeData}
          onChange={data => setTreeData(data)}
          getNodeKey={getNodeKey}
          canDrag={true}
          generateNodeProps={({ node, path }) => ({
            className: 'bg-gray-50 hover:bg-gray-100 rounded p-1',
            title: (
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => handleNodeClick({ node, path })}
              >
                <FontAwesomeIcon 
                  icon={
                    node.children ? 
                      (node.expanded ? faFolderOpen : faFolder) : 
                      faFileAlt
                  } 
                  className={`mr-2 ${node.children ? 'text-yellow-500' : 'text-indigo-500'}`}
                />
                <span>{node.title}</span>
                {node.type && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    node.type === 'topic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {node.type}
                  </span>
                )}
              </div>
            ),
            buttons: [
              <button
                key="add"
                className="p-1 text-green-600 hover:text-green-800"
                onClick={() => addNode(path)}
                title="Add Child"
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>,
              <button
                key="edit"
                className="p-1 text-blue-600 hover:text-blue-800"
                onClick={() => {
                  const newTitle = window.prompt('Enter new title', node.title);
                  if (newTitle) {
                    updateNodeTitle(path, newTitle);
                  }
                }}
                title="Edit"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>,
              <button
                key="delete"
                className="p-1 text-red-600 hover:text-red-800"
                onClick={() => removeNode(path)}
                title="Remove"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            ]
          })}
        />
      </div>
    </div>
  );
};

export default ContentTree;