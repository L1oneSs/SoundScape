"use client";

import uniqid from "uniqid";
import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import useUploadAlbumModal from "@/hooks/useUploadAlbum";
import { useUser } from "@/hooks/useUser";

import Modal from './Modal';
import Input from './Input';
import Button from './Button';

const UploadAlbum = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadAlbumModal = useUploadAlbumModal(); 
  const supabaseClient = useSupabaseClient();
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      title: '',
      description: '',
      image: null,
    }
  });

  const onChange = (open: boolean) => {
    if (!open) {
      reset();
      uploadAlbumModal.onClose();
    }
  }

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);
      
      const imageFile = values.image?.[0];

      if (!imageFile || !user) {
        toast.error('Missing fields')
        return;
      }

      const uniqueID = uniqid();

      const { 
        data: imageData, 
        error: imageError
      } = await supabaseClient
        .storage
        .from('images')
        .upload(`image-${values.title}-${uniqueID}`, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (imageError) {
        setIsLoading(false);
        return toast.error('Failed image upload');
      }


      const { error: supabaseError } = await supabaseClient
        .from('albums')
        .insert({
          user_id: user.id,
          title: values.title,
          release_year: values.release_year,
          genre: values.genre,
          artist: values.artist,
          image_url: imageData.path,
        });

      if (supabaseError) {
        return toast.error(supabaseError.message);
      }
      
      router.refresh();
      setIsLoading(false);
      toast.success('Album created!');
      reset();
      uploadAlbumModal.onClose();
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      title="Create an album"
      description="Upload album details"
      isOpen={uploadAlbumModal.isOpen}
      onChange={onChange}
    >
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-y-4"
      >
        <Input
          id="title"
          disabled={isLoading}
          {...register('title', { required: true })}
          placeholder="Album title"
        />
        <Input
          id="release_year"
          disabled={isLoading}
          {...register('release_year', { required: true })}
          placeholder="Release year"
        />
        <Input
          id="genre"
          disabled={isLoading}
          {...register('genre', { required: true })}
          placeholder="Genre"
        />
        <Input
          id="artist"
          disabled={isLoading}
          {...register('artist', { required: true })}
          placeholder="Artist"
        />
        <div>
          <div className="pb-1">
            Select an album cover image
          </div>
          <Input
            placeholder="test" 
            disabled={isLoading}
            type="file"
            accept="image/*"
            id="image"
            {...register('image', { required: true })}
          />
        </div>
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
}

export default UploadAlbum;
