import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import '../../styles/AccountPage.css';
import { toast } from 'react-toastify';
import defaultPfp from '../../assets/pfp.png';
import { useAuth } from "../../components/AuthContext"

const UserInfoPage = () => {
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [editMode, setEditMode] = useState({ fullName: false, email: false });
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth();

  const refs = {
    fullName: useRef(null),
    email: useRef(null),
  };

  const testUID = currentUser?.uid;

  useEffect(() => {
    const fetchUser = async () => {
      if (!testUID) {
        console.warn("No user is logged in, skipping fetch.");
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5001/users/${testUID}`);
        setUserData(res.data);
        setForm({
          fullName: res.data.fullName || '',
          email: res.data.email || '',
        });
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [testUID]);

  // Detect clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const updatedEditMode = { ...editMode };
      let changed = false;

      Object.keys(refs).forEach(field => {
        if (editMode[field] && refs[field].current && !refs[field].current.contains(e.target)) {
          updatedEditMode[field] = false;
          changed = true;
        }
      });

      if (changed) setEditMode(updatedEditMode);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editMode]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';

    // Re-enable scrolling on unmount
    return () => {
        document.body.style.overflow = 'auto';
    };
    }, []);


  const isFormDirty = () => {
    if (!userData) return false;
    return (
        form.fullName !== userData.fullName ||
        form.email !== userData.email
    );
    };


  const toggleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };

   const handleSave = async () => {
  const fieldsToUpdate = {};

  Object.keys(form).forEach((field) => {
    if (form[field] !== userData[field]) {
      fieldsToUpdate[field] = form[field];
    }
  });

  if (Object.keys(fieldsToUpdate).length === 0) {
    toast.info("No changes detected.");
    return;
  }

  try {
    await axios.patch(`http://localhost:5001/users/${testUID}`, fieldsToUpdate);
    setUserData(prev => ({ ...prev, ...fieldsToUpdate }));
    setEditMode({ fullName: false, email: false });
    toast.success("Changes saved!");
  } catch (err) {
    console.error("Failed to save changes:", err);
    toast.error("Something went wrong. Please try again.");
  }
};



  if (loading) return <p>Loading...</p>;

  return (
    <div className="user-info-container">
      <div className="user-header">
        <img
          src={defaultPfp || userData.profilePicture }
          alt="Profile"
          className="user-profile-pic"
        />
        <div className="user-header-text">
          <h2>{form.fullName}</h2>
          <p>{form.email}</p>
        </div>
      </div>

      <div className="user-form">
        {["fullName", "email"].map((field) => (
          <div key={field} className="editable-field" ref={refs[field]}>
            <input
              name={field}
              placeholder={field === "email" ? "Email" : "Full Name"}
              value={form[field]}
              onChange={handleChange}
              readOnly={!editMode[field]}
              className="user-input"
            />
            <EditIcon
              className="edit-icon"
              onClick={() => toggleEdit(field)}
              titleAccess={`Edit ${field}`}
            />
          </div>
        ))}
        <button
            onClick={handleSave}
            className="user-save-button"
            disabled={!isFormDirty()}
            >
            Save Changes
        </button>
      </div>
    </div>
  );
};

export default UserInfoPage;