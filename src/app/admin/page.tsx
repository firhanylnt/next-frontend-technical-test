"use client";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import axiosInstance from "@/utils/axios";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {format} from "date-fns";
import ErrorHandler from "@/utils/error-handler";

// Event type
interface Event {
  id: number;
  name: string;
  description: string;
  date: string | Date;
}

const EventList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [limit] = useState<number>(3);
  
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("Event name is required"),
    description: Yup.string().required("Event description is required"),
    date: Yup.date().required("Event date is required"),
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/events", {
        params: {
          offset,
          limit,
        },
      });
      setEvents(response.data.events);
      setTotalRows(response.data.totalRows);
    } catch (err) {
      ErrorHandler(err);
    }
  }, [offset, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSaveEvent = async (values: Event) => {
    try {
      if (isEditing && currentEvent) {
        await axiosInstance.put(`/api/events/${currentEvent.id}`, values);
        fetchEvents();
        Swal.fire("Event Updated!", "The event has been updated.", "success");
      } else {
        const response = await axiosInstance.post("/api/events", values);
        fetchEvents();
        Swal.fire("Event Created!", "Your event has been added.", "success");
      }

      setIsPopupOpen(false);
      setCurrentEvent(null);
      setIsEditing(false);
    } catch (err) {
      ErrorHandler(err);
    }
  };

  const openCreatePopup = () => {
    setCurrentEvent({ id: 0, name: "", description: "", date: new Date() });
    setIsEditing(false);
    setIsPopupOpen(true);
  };

  const openEditPopup = (event: Event) => {
    setCurrentEvent(event);
    setIsEditing(true);
    setIsPopupOpen(true);
  };

  const deleteEvent = async (id: number) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await axiosInstance.delete(`/api/events/${id}`);
          fetchEvents();
          Swal.fire("Deleted!", "Your event has been deleted.", "success");
        }
      });
    } catch (err) {
      ErrorHandler(err);
    }
  };

  const getPaginatedEvents = () => {
    const paginatedEvents = events && events.length > 0 ? events.slice(offset, offset + limit) : [];
  
    return {
      events: paginatedEvents,
      totalRows,
      limit,
      offset,
    };
  };
  

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    setOffset(newOffset);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event List</h1>
        <button
          onClick={openCreatePopup}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Event
        </button>
      </div>
      <table className="w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left border-b">Name</th>
            <th className="px-4 py-2 text-left border-b">Description</th>
            <th className="px-4 py-2 text-left border-b">Date</th>
            <th className="px-4 py-2 text-center border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {getPaginatedEvents().events.map((event) => (
            <tr key={event.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b">{event.name}</td>
              <td className="px-4 py-2 border-b">{event.description}</td>
              <td className="px-4 py-2 border-b">
                {event.date
                        ? format(new Date(event.date), 'dd MMM y')
                        : ''}
                </td>
              <td className="px-4 py-2 border-b text-center">
                <button
                  onClick={() => openEditPopup(event)}
                  className="px-2 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Edit
                </button>{" "}
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(Math.floor(offset / limit))}
          disabled={offset === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="mx-4 self-center">{Math.floor(offset / limit) + 1}</span>
        <button
          onClick={() => handlePageChange(Math.floor(offset / limit) + 2)}
          disabled={offset + limit >= totalRows}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h2>
            <Formik
              initialValues={{
                id: 0,
                name: currentEvent?.name || "",
                description: currentEvent?.description || "",
                date: currentEvent?.date ? new Date(currentEvent.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
              }}
              validationSchema={validationSchema}
              onSubmit={(values) => handleSaveEvent(values)}
            >
              {({ values, handleChange, handleBlur, errors, touched }) => (
                <Form>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Field
                      type="text"
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                    />
                    {touched.name && errors.name && (
                      <div className="text-red-500 text-sm">{errors.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Field
                      type="text"
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                    />
                    {touched.description && errors.description && (
                      <div className="text-red-500 text-sm">{errors.description}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <Field
                      type="date"
                      name="date"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
                    />
                    {touched.date && errors.date && typeof errors.date === "string" && (
                      <div className="text-red-500 text-sm">{errors.date}</div>
                    )}
                  </div>


                  <div className="flex justify-end">
                    <button
                    onClick={() => setIsPopupOpen(false)}
                      type="button"
                      className="px-4 py-2 bg-white text-black rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {isEditing ? "Update Event" : "Create Event"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
