import { useState, useEffect, useRef } from "react";
import { useStore } from "../stores/useStore";
import { useAppStore } from "../stores/useAppStore";
import Button from "../components/Button";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import Card from "../components/Card";
import { useUiStore } from "../stores/useUiStore";

export default function BookBank() {
    const { createBookListing, queryBooks, books, deleteBook, requestBook } =
        useStore();
    const { user } = useAppStore();
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
    const [image, setImage] = useState("");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [q, setQ] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        queryBooks();
    }, []);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            useUiStore
                .getState()
                .notify("File size must be less than 5MB", "warning");
            return;
        }
        if (!file.type.startsWith("image/")) {
            useUiStore
                .getState()
                .notify("Please select an image file", "warning");
            return;
        }
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImage(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const nextErrors: Record<string, string> = {};
        if (!title.trim())
            nextErrors.title = "Please provide a title for the book.";
        if (bookType === "sell" && !price.trim())
            nextErrors.price = "Please provide a selling price.";
        if (bookType === "rent" && !rent.trim())
            nextErrors.rent = "Please provide a monthly rent.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
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
            image,
            hostel: location,
        } as any);
        setTitle("");
        setAuthor("");
        setEdition("");
        setIsbn("");
        setPrice("");
        setRent("");
        setDescription("");
        setImage("");
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        if (errors.title)
                                            setErrors((s) => ({
                                                ...s,
                                                title: "",
                                            }));
                                    }}
                                    placeholder="Book title"
                                />
                                {errors.title && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.title}
                                    </div>
                                )}
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
                                {image && (
                                    <div className="mt-2 relative">
                                        <img
                                            src={image}
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
                                                setImage("");
                                                setPhotoFile(null);
                                                if (fileInputRef.current)
                                                    fileInputRef.current.value =
                                                        "";
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
                                        onChange={(e) => {
                                            setPrice(e.target.value);
                                            if (errors.price)
                                                setErrors((s) => ({
                                                    ...s,
                                                    price: "",
                                                }));
                                        }}
                                        placeholder="Selling price"
                                    />
                                    {errors.price && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {errors.price}
                                        </div>
                                    )}
                                </FormField>
                            )}
                            {bookType === "rent" && (
                                <FormField label={"Rent per month (₹)"}>
                                    <input
                                        type="number"
                                        className="w-full border rounded px-3 py-2"
                                        value={rent}
                                        onChange={(e) => {
                                            setRent(e.target.value);
                                            if (errors.rent)
                                                setErrors((s) => ({
                                                    ...s,
                                                    rent: "",
                                                }));
                                        }}
                                        placeholder="Rent per month"
                                    />
                                    {errors.rent && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {errors.rent}
                                        </div>
                                    )}
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
                    {books && books.length === 0 && (
                        <div className="text-center text-slate-500 py-12 bg-white rounded shadow">
                            No books found
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {books &&
                            books.map((b: any) => {
                                const available = b.status
                                    ? b.status === "available"
                                    : true;
                                const isOwner =
                                    user &&
                                    (b.createdBy === user.id ||
                                        b.owner === user.id ||
                                        b.userId === user.id);
                                const canRequest = available && !isOwner;
                                return (
                                    <Card
                                        key={b.id || b._id}
                                        className="p-0 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                                    >
                                        <div className="relative">
                                            {b.image ? (
                                                <img
                                                    src={b.image}
                                                    alt={b.title}
                                                    className="w-full h-44 object-cover"
                                                    onError={(e) => {
                                                        (
                                                            e.target as HTMLImageElement
                                                        ).style.display =
                                                            "none";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-44 bg-slate-100 flex items-center justify-center text-slate-400">
                                                    No Image
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-medium shadow">
                                                {b.type === "sell"
                                                    ? "For Sale"
                                                    : b.type === "rent"
                                                    ? "For Rent"
                                                    : "Free"}
                                            </div>
                                            {b.type === "sell" && b.price && (
                                                <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-sm font-semibold shadow">
                                                    ₹{b.price}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="mb-2">
                                                <div
                                                    className="font-semibold text-lg truncate"
                                                    title={b.title}
                                                >
                                                    {b.title}
                                                </div>
                                                <div className="text-sm text-slate-600 truncate">
                                                    {b.author &&
                                                        `by ${b.author}`}{" "}
                                                    {b.edition &&
                                                        `• ${b.edition}`}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500 space-y-1 mb-3">
                                                <div>
                                                    Category: {b.category}
                                                </div>
                                                <div>
                                                    Condition:{" "}
                                                    {b.condition || "N/A"}
                                                </div>
                                                <div>
                                                    Location: {b.location}
                                                </div>
                                                {b.isbn && (
                                                    <div>ISBN: {b.isbn}</div>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-600 flex-1 overflow-hidden">
                                                {b.description ? (
                                                    <p className="line-clamp-3">
                                                        {b.description}
                                                    </p>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        No description
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <StatusBadge
                                                    status={
                                                        b.status || "available"
                                                    }
                                                />
                                                <div className="flex gap-2">
                                                    {canRequest && (
                                                        <>
                                                            {b.type ===
                                                                "sell" && (
                                                                <Button
                                                                    variant="primary"
                                                                    className="btn-sm"
                                                                    onClick={async () => {
                                                                        const ok =
                                                                            await useUiStore
                                                                                .getState()
                                                                                .confirmDialog(
                                                                                    "Request to buy this book?"
                                                                                );
                                                                        if (!ok)
                                                                            return;
                                                                        try {
                                                                            await requestBook(
                                                                                b.id ||
                                                                                    b._id
                                                                            );
                                                                            useUiStore
                                                                                .getState()
                                                                                .notify(
                                                                                    "Request sent",
                                                                                    "success"
                                                                                );
                                                                            await queryBooks();
                                                                        } catch (err: any) {
                                                                            useUiStore
                                                                                .getState()
                                                                                .notify(
                                                                                    "Failed to request book: " +
                                                                                        (err?.message ||
                                                                                            err),
                                                                                    "error"
                                                                                );
                                                                        }
                                                                    }}
                                                                >
                                                                    Buy
                                                                </Button>
                                                            )}
                                                            {b.type ===
                                                                "rent" && (
                                                                <Button
                                                                    variant="secondary"
                                                                    className="btn-sm"
                                                                    onClick={async () => {
                                                                        const ok =
                                                                            await useUiStore
                                                                                .getState()
                                                                                .confirmDialog(
                                                                                    "Request to rent this book?"
                                                                                );
                                                                        if (!ok)
                                                                            return;
                                                                        try {
                                                                            await requestBook(
                                                                                b.id ||
                                                                                    b._id
                                                                            );
                                                                            useUiStore
                                                                                .getState()
                                                                                .notify(
                                                                                    "Request sent",
                                                                                    "success"
                                                                                );
                                                                            await queryBooks();
                                                                        } catch (err: any) {
                                                                            useUiStore
                                                                                .getState()
                                                                                .notify(
                                                                                    "Failed to request book: " +
                                                                                        (err?.message ||
                                                                                            err),
                                                                                    "error"
                                                                                );
                                                                        }
                                                                    }}
                                                                >
                                                                    Rent
                                                                </Button>
                                                            )}
                                                            {b.type ===
                                                                "free" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    className="btn-sm"
                                                                    onClick={async () => {
                                                                        const ok =
                                                                            await useUiStore
                                                                                .getState()
                                                                                .confirmDialog(
                                                                                    "Request this free book?"
                                                                                );
                                                                        if (!ok)
                                                                            return;
                                                                        try {
                                                                            await requestBook(
                                                                                b.id ||
                                                                                    b._id
                                                                            );
                                                                            useUiStore
                                                                                .getState()
                                                                                .notify(
                                                                                    "Request sent",
                                                                                    "success"
                                                                                );
                                                                            await queryBooks();
                                                                        } catch (err: any) {
                                                                            useUiStore
                                                                                .getState()
                                                                                .notify(
                                                                                    "Failed to request book: " +
                                                                                        (err?.message ||
                                                                                            err),
                                                                                    "error"
                                                                                );
                                                                        }
                                                                    }}
                                                                >
                                                                    Request
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {(user?.role === "admin" ||
                                                        isOwner) && (
                                                        <Button
                                                            variant="danger"
                                                            className="btn-sm"
                                                            onClick={async () => {
                                                                const ok =
                                                                    await useUiStore
                                                                        .getState()
                                                                        .confirmDialog(
                                                                            "Delete this book listing?"
                                                                        );
                                                                if (!ok) return;
                                                                try {
                                                                    await deleteBook(
                                                                        b.id ||
                                                                            b._id
                                                                    );
                                                                    useUiStore
                                                                        .getState()
                                                                        .notify(
                                                                            "Book deleted",
                                                                            "success"
                                                                        );
                                                                    await queryBooks();
                                                                } catch (err: any) {
                                                                    useUiStore
                                                                        .getState()
                                                                        .notify(
                                                                            "Failed to delete book: " +
                                                                                (err?.message ||
                                                                                    err),
                                                                            "error"
                                                                        );
                                                                }
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                    </div>
                </div>
            </div>
        </div>
    );
}
