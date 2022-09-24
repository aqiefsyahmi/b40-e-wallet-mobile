import { useState, useEffect } from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import moment from "moment";

import { Refresh, TransactionItem, FilterList } from "../components";

import instanceAxios from "../lib/instanceAxios";
import { useUserContext } from "../hooks";
import { useFilterDate } from "../utils/filterDate";
import { getValueFor } from "../utils/SecureStore";

import { globals, transactionStyle } from "../styles";

const Transaction = ({ navigation }) => {
  const [collapse, setCollapse] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [list, setList] = useState([
    {
      id: 0,
      label: "All",
      checked: true,
    },
    {
      id: 1,
      label: "Today",
      checked: false,
    },
    {
      id: 2,
      label: "Week",
      checked: false,
    },
    {
      id: 3,
      label: "Month",
      checked: false,
    },
  ]);
  const [filterTransaction, setFilterTransaction] = useState([]);

  const { user } = useUserContext();
  const filterDate = useFilterDate();

  const onCollapse = () => setCollapse(prev => !prev);

  const getTransactions = (id, token) => {
    return instanceAxios
      .get(`/api/transactions/${user.student ? `students` : `cafe`}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => res.data)
      .catch((err) => {
        return false
      });
  };

  const onList = id =>
    setList(prev =>
      prev.map(data => {
        if (data.id == id) {
          return { ...data, checked: true };
        } else {
          return { ...data, checked: false };
        }
      })
    );

  useEffect(() => {
    const header = async () => {
      navigation.setOptions({
        headerRight: () => (
          <View style={transactionStyle.row}>
            <TouchableOpacity onPress={onCollapse}>
              <Image
                style={transactionStyle.fitlerIcon}
                source={require("../assets/icons/filter-icon.png")}
              />
            </TouchableOpacity>
          </View>
        ),
      });
    };

    header();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const token = await getValueFor("accessToken");
      const res = await getTransactions(user.id, token);

      res && setTransactions(res);
    };
    fetch();
  }, [user.refresh]);

  useEffect(() => {
    list.map(({ checked, id }) => {
      const filtered = filterDate(transactions);
      if (checked) {
        id === 0 && setFilterTransaction(filtered.getAll);
        id === 1 && setFilterTransaction(filtered.getToday);
        id === 2 && setFilterTransaction(filtered.getWeek);
        id === 3 && setFilterTransaction(filtered.getMonth);
      }
    });
  }, [list, transactions]);

  return (
    <View style={[globals.container]}>
      <Refresh>
        <View style={{ paddingBottom: 24 }}>
          {filterTransaction?.length > 0 &&
            filterTransaction.map(({ sender, amount, created_at, transaction_id, cafe_name, student_name }, i) => {
              let details = {
                sender: `${student_name} (${sender})`,
                recipient: cafe_name,
                transactionId: transaction_id,
                amount: `RM${amount}`,
                date: `${moment(created_at).format("D-MM-YYYY")} at ${moment(created_at).format("h.mma")}`
              }

              return (
                <View style={transactionStyle.transactionItemWrap} key={i}>
                  <TransactionItem
                    field1={sender}
                    time={moment(created_at).format("h.mma")}
                    date={moment(created_at).format("D-MM")}
                    amount={amount}
                    cafe={!user.student}
                    noBorder={true}
                    navigate={() => navigation.navigate("Transaction Details", { data: details })}
                  />
                </View>
              );
            })}
        </View>
      </Refresh>
      {filterTransaction.length === 0 && (
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontWeight: "500",
            color: "rgba(132, 132, 132, 1)",
          }}
        >
          No transactions history
        </Text>
      )}
      {collapse && (
        <FilterList
          onCollapse={onCollapse}
          list={list}
          onList={onList}
          document={filterTransaction}
          filterState={state => setFilter(state)}
        />
      )}
    </View>
  );
};

export default Transaction;
