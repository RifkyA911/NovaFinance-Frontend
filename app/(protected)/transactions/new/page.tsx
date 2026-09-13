"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Input, Select, Button } from "@heroui/react";

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    categoryId: "",
    accountId: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement API call to create transaction
    console.log("Creating transaction:", formData);
    setLoading(false);
    router.push("/transactions");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">New Transaction</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Description"
              labelPlacement="outside"
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              isRequired
              variant="bordered"
            />

            <Input
              label="Amount"
              labelPlacement="outside"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              isRequired
              variant="bordered"
            />

            <Select
              label="Type"
              labelPlacement="outside"
              selectedKeys={[formData.type]}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              isRequired
              variant="bordered"
            >
              <option key="expense">Expense</option>
              <option key="income">Income</option>
            </Select>

            <Select
              label="Category"
              labelPlacement="outside"
              placeholder="Select category"
              selectedKeys={formData.categoryId ? [formData.categoryId] : []}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              isRequired
              variant="bordered"
            >
              <option key="1">Food & Dining</option>
              <option key="2">Transportation</option>
              <option key="3">Utilities</option>
              <option key="4">Shopping</option>
              <option key="5">Entertainment</option>
            </Select>

            <Select
              label="Account"
              labelPlacement="outside"
              placeholder="Select account"
              selectedKeys={formData.accountId ? [formData.accountId] : []}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
              isRequired
              variant="bordered"
            >
              <option key="1">BCA Main</option>
              <option key="2">Mandiri Savings</option>
              <option key="3">GoPay</option>
              <option key="4">Cash</option>
            </Select>

            <Input
              label="Date"
              labelPlacement="outside"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              isRequired
              variant="bordered"
            />
          </div>

          <textarea
            placeholder="Add notes (optional)"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={4}
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
          />

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1 bg-blue-600 text-white"
            >
              <Save size={20} />
              Save Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
