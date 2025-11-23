"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon } from '@iconify/react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/config/axiosInstance';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

// Validation schema
const blogSchema = yup.object().shape({
  title: yup
    .string()
    .required('Blog title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: yup
    .string()
    .required('Blog description is required')
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description must be less than 500 characters'),
  content: yup
    .string()
    .required('Blog content is required')
    .min(50, 'Content must be at least 50 characters'),
  tags: yup
    .array()
    .of(yup.string())
    .nullable(),
  status: yup
    .string()
    .oneOf(['draft', 'published'], 'Invalid status')
    .default('draft'),
  featuredImage: yup
    .mixed()
    .nullable()
    .test('fileType', 'Only image files are allowed', (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      return file && file.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 5MB', (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      return file && file.size <= 5 * 1024 * 1024;
    }),
});

function EditBlog() {
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [currentTags, setCurrentTags] = useState([]);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [imageChanged, setImageChanged] = useState(false);

  const router = useRouter();
  const params = useParams();
  const blogId = params.id;
  const { token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(blogSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      tags: [],
      status: 'draft',
      featuredImage: null,
    },
  });

  // Fetch blog data
  useEffect(() => {
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId]);

  const fetchBlogData = async () => {
    try {
      setLoadingBlog(true);
      const response = await axiosInstance.get(`/admin/blogs/${blogId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blog = response.data.data;
      
      // Set form values
      setValue('title', blog.title);
      setValue('description', blog.description);
      setValue('content', blog.content);
      setValue('status', blog.status);
      
      // Set tags
      if (blog.tags && blog.tags.length > 0) {
        setCurrentTags(blog.tags);
        setValue('tags', blog.tags);
      }

      // Set existing image
      if (blog.featuredImage) {
        setExistingImage(blog.featuredImage);
      }

    } catch (error) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to load blog data');
      setTimeout(() => {
        router.push('/admin/blogs');
      }, 2000);
    } finally {
      setLoadingBlog(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setImageChanged(true);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      setImageChanged(false);
      setValue('featuredImage', null);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!currentTags.includes(tagInput.trim())) {
        const newTags = [...currentTags, tagInput.trim()];
        setCurrentTags(newTags);
        setValue('tags', newTags);
        setTagInput('');
      } else {
        toast.error('Tag already exists');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    setCurrentTags(newTags);
    setValue('tags', newTags);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('content', data.content);
      formData.append('status', data.status);

      if (currentTags.length > 0) {
        formData.append('tags', JSON.stringify(currentTags));
      }

      // Only append image if a new one was selected
      if (imageChanged && data.featuredImage && data.featuredImage.length > 0) {
        formData.append('featuredImage', data.featuredImage[0]);
      }

      const response = await axiosInstance.put(`/admin/blogs/${blogId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });

      toast.success(response.data.message || 'Blog updated successfully!');
      setSubmitSuccess('Blog updated successfully!');

      setUploadProgress(0);

      setTimeout(() => setSubmitSuccess(''), 5000);
      setTimeout(() => {
        router.push('/admin/blogs');
      }, 2000);
    } catch (error) {
      console.error('Error updating blog:', error);
      setUploadProgress(0);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to update blog. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    router.push('/admin/blogs');
  };

  const removeImage = () => {
    setImagePreview(null);
    setExistingImage(null);
    setImageChanged(true);
    setValue('featuredImage', null);
    const fileInput = document.getElementById('featuredImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (loadingBlog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon icon="mdi:loading" className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Back to blogs"
              >
                <Icon icon="mdi:arrow-left" className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
                <p className="text-gray-600 mt-1">Update your blog post</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-green-800">{submitSuccess}</p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Blog Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Blog Title *
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Blog Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter a brief description of your blog"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Blog Content */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content *
                </label>
                <textarea
                  id="content"
                  {...register('content')}
                  rows="15"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono ${
                    errors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Write your blog content here... (You can use HTML/Markdown)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  💡 Tip: You can write in HTML or Markdown format
                </p>
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type a tag and press Enter"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Press Enter to add tags
                </p>

                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-primary-900"
                        >
                          <Icon icon="mdi:close" className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Featured Image Upload */}
              <div>
                <label
                  htmlFor="featuredImage"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Featured Image
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a new featured image (optional). Supported formats: JPG,
                  PNG, GIF, WebP. Max size: 5MB.
                </p>

                <div className="space-y-4">
                  <input
                    type="file"
                    id="featuredImage"
                    {...register('featuredImage')}
                    onChange={(e) => {
                      register('featuredImage').onChange(e);
                      handleImageChange(e);
                    }}
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />

                  {errors.featuredImage && (
                    <p className="text-sm text-red-600">
                      {errors.featuredImage.message}
                    </p>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Image Preview (New or Existing) */}
                  {(imagePreview || existingImage) && (
                    <div className="relative inline-block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <img
                          src={imagePreview || existingImage}
                          alt="Featured image"
                          className="max-w-full max-h-64 object-contain mx-auto"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <Icon icon="mdi:close" className="w-4 h-4" />
                      </button>
                      {existingImage && !imagePreview && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Current featured image
                        </p>
                      )}
                      {imagePreview && (
                        <p className="text-xs text-green-600 mt-2 text-center">
                          New image selected
                        </p>
                      )}
                    </div>
                  )}

                  {/* Upload Area */}
                  {!imagePreview && !existingImage && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Icon
                        icon="mdi:cloud-upload"
                        className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      />
                      <p className="text-gray-500 text-sm">
                        No image selected. Click "Choose File" above to upload a
                        featured image.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress > 0}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                  )}
                  {uploadProgress > 0
                    ? `Uploading ${uploadProgress}%`
                    : 'Update Blog'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;