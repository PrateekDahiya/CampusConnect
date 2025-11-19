import { useState, useEffect, useRef } from "react";
import { useStore } from "../stores/useStore";
import Button from "../components/Button";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";

export default function BookBank() {
    const { createBookListing, queryBooks, books } = useStore();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [edition, setEdition] = useState("");
    const [condition, setCondition] = useState("new");
    const [category, setCategory] = useState("Engineering");
    const [isbn, setIsbn] = useState("");
    const [price, setPrice] = useState("");
    const [rent, setRent] = useState("");
    const [bookType, setBookType] = useState<"sell" | "rent" | "free">("sell");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("Hostel A");
    const [photo, setPhoto] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [q, setQ] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        queryBooks();
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }

            // Validate file type
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            setPhotoFile(file);
            // Create a data URL for preview and storage
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCreate = async (e: any) => {
        e.preventDefault();
        if (!title.trim()) return;
        await createBookListing({
            title,
            author,
            edition,
            condition,
            category,
            isbn,
            price: price ? parseFloat(price) : undefined,
            rent: rent ? parseFloat(rent) : undefined,
            type: bookType,
            description,
            photo,
            location,
            owner: "user1",
        });
        setTitle("");
        setAuthor("");
        setEdition("");
        setIsbn("");
        setPrice("");
        setRent("");
        setDescription("");
        setPhoto("");
        setPhotoFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setShowForm(false);
        await queryBooks();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Book Bank</h1>
                        <p className="text-slate-600">
                            Upload books for sale or rent, or browse listings.
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? "Cancel" : "Add Book"}
                    </Button>
                </div>

                {showForm && (
                    <form
                        onSubmit={onCreate}
                        className="bg-white p-6 rounded shadow space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={"Title *"}>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Book title"
                                />
                            </FormField>
                            <FormField label={"Author"}>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    placeholder="Author name"
                                />
                            </FormField>
                            <FormField label={"Edition/Year"}>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={edition}
                                    onChange={(e) => setEdition(e.target.value)}
                                    placeholder="e.g. 3rd Edition, 2022"
                                />
                            </FormField>
                            <FormField label={"Condition"}>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={condition}
                                    onChange={(e) =>
                                        setCondition(e.target.value)
                                    }
                                >
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                    <option value="damaged">Damaged</option>
                                </select>
                            </FormField>
                            <FormField label={"Category"}>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                >
                                    <option>Engineering</option>
                                    <option>Literature</option>
                                    <option>Science</option>
                                    <option>Mathematics</option>
                                    <option>Business</option>
                                    <option>Other</option>
                                </select>
                            </FormField>
                            <FormField label={"ISBN (optional)"}>
                                <input
                                    className="w-full border rounded px-3 py-2"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                    placeholder="ISBN number"
                                />
                            </FormField>
                            <FormField label={"Book Photo (optional)"}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={handlePhotoUpload}
                                />
                                {photo && (
                                    <div className="mt-2 relative">
                                        <img
                                            src={photo}
                                            alt="Book preview"
                                            className="h-20 w-16 object-cover rounded border"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).style.display = "none";
                                            }}
                                        />
                                        {photoFile && (
                                            <div className="mt-1 text-xs text-slate-500">
                                                {photoFile.name} (
                                                {Math.round(
                                                    photoFile.size / 1024
                                                )}
                                                KB)
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPhoto("");
                                                setPhotoFile(null);
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.value =
                                                        "";
                                                }
                                            }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </FormField>
                            <FormField label={"Book Type"}>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={bookType}
                                    onChange={(e) =>
                                        setBookType(
                                            e.target.value as
                                                | "sell"
                                                | "rent"
                                                | "free"
                                        )
                                    }
                                >
                                    <option value="sell">For Sale</option>
                                    <option value="rent">For Rent</option>
                                    <option value="free">Free Giveaway</option>
                                </select>
                            </FormField>
                            <FormField label={"Location"}>
                                <select
                                    className="w-full border rounded px-3 py-2"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                >
                                    <option>Hostel A</option>
                                    <option>Hostel B</option>
                                    <option>Hostel C</option>
                                    <option>Library</option>
                                    <option>Academic Block</option>
                                </select>
                            </FormField>
                            {bookType === "sell" && (
                                <FormField label={"Price (₹)"}>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(e.target.value)
                                        }
                                        placeholder="Selling price"
                                    />
                                </FormField>
                            )}
                            {bookType === "rent" && (
                                <FormField label={"Rent per month (₹)"}>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={rent}
                                        onChange={(e) =>
                                            setRent(e.target.value)
                                        }
                                        placeholder="Rent per month"
                                    />
                                </FormField>
                            )}
                        </div>
                        <FormField label={"Description"}>
                            <textarea
                                className="w-full border rounded px-3 py-2"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Additional notes about the book..."
                            />
                        </FormField>
                        <div className="flex gap-2">
                            <Button type="submit" variant="primary">
                                Create Listing
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <input
                            className="border rounded px-3 py-2 flex-1"
                            placeholder="Search by title, author, ISBN"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                        <Button
                            variant="ghost"
                            onClick={() => queryBooks({ q })}
                        >
                            Search
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setQ("");
                                queryBooks();
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {books &&
                            books.map((b: any) => (
                                <div
                                    key={b.id}
                                    className="bg-white p-4 rounded shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4 flex-1">
                                            {b.photo && (
                                                <img
                                                    src={b.photo}
                                                    alt={b.title}
                                                    className="w-20 h-24 object-cover rounded border flex-shrink-0"
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).style.display =
                                                            "none";
                                                    }}
                                                />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-semibold text-lg">
                                                    {b.title}
                                                </div>
                                                <div className="text-sm text-slate-600 mb-2">
                                                    by {b.author}{" "}
                                                    {b.edition &&
                                                        `• ${b.edition}`}
                                                </div>
                                                <div className="flex gap-4 text-xs text-slate-500 mb-3">
                                                    <span>
                                                        Category: {b.category}
                                                    </span>
                                                    <span>
                                                        Condition:{" "}
                                                        {b.condition || "N/A"}
                                                    </span>
                                                    <span>
                                                        Location: {b.location}
                                                    </span>
                                                    {b.isbn && (
                                                        <span>
                                                            ISBN: {b.isbn}
                                                        </span>
                                                    )}
                                                </div>
                                                {b.description && (
                                                    <p className="text-sm text-slate-600 mb-3">
                                                        {b.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4">
                                                    <div className="text-sm font-medium">
                                                        {b.type === "sell" &&
                                                            b.price &&
                                                            `₹${b.price}`}
                                                        {b.type === "rent" &&
                                                            b.rent &&
                                                            `₹${b.rent}/month`}
                                                        {b.type === "free" &&
                                                            "Free"}
                                                    </div>
                                                    <StatusBadge
                                                        status={b.status}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            {b.status === "available" && (
                                                <>
                                                    {b.type === "sell" && (
                                                        <Button
                                                            variant="primary"
                                                            className="btn-sm"
                                                        >
                                                            Buy Now
                                                        </Button>
                                                    )}
                                                    {b.type === "rent" && (
                                                        <Button
                                                            variant="secondary"
                                                            className="btn-sm"
                                                        >
                                                            Rent
                                                        </Button>
                                                    )}
                                                    {b.type === "free" && (
                                                        <Button
                                                            variant="ghost"
                                                            className="btn-sm"
                                                        >
                                                            Request
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
